package com.audition.vietphuc.service;

import com.audition.vietphuc.dto.EvaluationRequest;
import com.audition.vietphuc.dto.EvaluationResponse;
import com.audition.vietphuc.model.WardrobeItem;
import com.audition.vietphuc.repository.WardrobeItemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class GeminiService {

    private static final Logger log = LoggerFactory.getLogger(GeminiService.class);

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.model:gemini-3.8-flash}")
    private String modelName;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models}")
    private String apiUrl;

    @Value("${gemini.api.max-retries:3}")
    private int maxRetries;

    @Value("${gemini.api.retry-backoff-ms:1000}")
    private long retryBackoffMs;

    private final WardrobeItemRepository wardrobeItemRepository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(WardrobeItemRepository wardrobeItemRepository, RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.wardrobeItemRepository = wardrobeItemRepository;
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Evaluates outfit remix with Gemini AI, featuring Chị Gatekeeper persona,
     * cultural heritage rules, and automatic retry for 503 errors.
     */
    public EvaluationResponse evaluateOutfit(EvaluationRequest request) {
        List<WardrobeItem> selectedItems = wardrobeItemRepository.findAllById(request.getItemIds());

        String itemsDescription = selectedItems.stream()
                .map(item -> String.format("- %s (Phân loại: %s, Thời kỳ/Vùng: %s, Bối cảnh lịch sử: %s)",
                        item.getName(), item.getCategory(), item.getEra(),
                        item.getCulturalContext() != null ? item.getCulturalContext() : "Di sản truyền thống"))
                .collect(Collectors.joining("\n"));

        String systemPrompt = """
            Bạn là "Chị Gatekeeper" – vị giám khảo thời trang Việt Phục Remix khét tiếng của Gen-Z Việt Nam trên nền tảng Audition Viet Phuc Remix.
            Tính cách của bạn:
            - Rất am hiểu lịch sử trang phục Việt (Áo Nhật Bình triều Nguyễn, Áo Giao Lĩnh triều Lê, Áo Tấc, Ngũ Thân tay chẽn, Yếm Lụa Hà Đông, Nón Ngựa Gò Găng, Guốc Mộc...).
            - Giọng văn cực kỳ hài hước, đanh đá nhưng có tâm, đậm chất Gen-Z Việt Nam (dùng từ lóng: 'quá keo', 'mlem', 'red flag', 'báo thủ', 'cháy phố', '10 điểm không có nhưng', 'slay', 'dính dách', 'over hợp').
            - QUY TẮC CỐT LÕI VỀ VĂN HÓA:
              + Ủng hộ việc remix sáng tạo để Việt phục đi vào đời sống (mặc với sneaker, blazer, kính râm, boots cao cổ...).
              + TUYỆT ĐỐI KHÔNG duyệt các kiểu mặc xúc phạm di sản: mặc Nhật Bình hoàng gia hở hang không nội y, mang nón quai thao đi bar nhảy sàn phản cảm, dùng hoa văn hoàng gia sai vị trí cung đình hoặc biến tấu cẩu thả.
              + Đánh giá dựa trên sự hòa hợp giữa món đồ truyền thống và Sự kiện (event) mà người mặc tham gia.
            """;

        String userPrompt = String.format("""
            Hãy chấm điểm và nhận xét bộ trang phục Việt Phục Remix này:
            - Sự kiện / Bối cảnh xuất hiện: %s
            - Phong cách Remix định hướng: %s
            - Ghi chú thêm từ người mặc: %s
            - Các món đồ đã chọn trong phòng thử:
            %s

            VUI LÒNG TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON SAU (không dùng markdown code fence, chỉ trả về raw JSON text):
            {
              "status": "APPROVED hoặc REJECTED",
              "culturalScore": 85,
              "gatekeeperTitle": "Danh hiệu hài hước Chị Gatekeeper ban tặng (ví dụ: Công Chúa Đi Bụi Slay Hết Nước Chấm, Bà Chúa Nhật Bình Bùi Viện...)",
              "feedback": "Lời nhận xét của Chị Gatekeeper bằng tiếng Việt Gen-Z vừa sắc bén vừa hài hước",
              "culturalNotes": "Kiến thức lịch sử và lưu ý văn hóa chuẩn xác về các món đồ truyền thống vừa phối",
              "stylingTips": "Lời khuyên phối đồ để outfit cháy hơn hoặc khắc phục điểm yếu",
              "hashtags": ["#VietPhucRemix", "#AuditionStyle", "#AoNhatBinh"]
            }
            """,
                request.getEvent(),
                request.getRemixStyle() != null ? request.getRemixStyle() : "Gen-Z Street Remix",
                request.getCustomNotes() != null ? request.getCustomNotes() : "Tự tin tỏa sáng",
                itemsDescription
        );

        if (apiKey != null && !apiKey.isBlank() && !apiKey.equals("MY_GEMINI_API_KEY")) {
            try {
                return callGeminiWithRetry(systemPrompt, userPrompt);
            } catch (Exception e) {
                log.warn("Gemini API call failed after retries: {}. Falling back to Smart Cultural Heuristic Engine.", e.getMessage());
            }
        }

        // Smart Cultural Heuristic Fallback Engine
        return generateHeuristicEvaluation(request, selectedItems);
    }

    private EvaluationResponse callGeminiWithRetry(String systemPrompt, String userPrompt) throws Exception {
        String endpoint = String.format("%s/%s:generateContent?key=%s", apiUrl, modelName, apiKey);

        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> systemInstructionPart = Map.of("parts", List.of(Map.of("text", systemPrompt)));
        requestBody.put("systemInstruction", systemInstructionPart);

        Map<String, Object> userContent = Map.of("parts", List.of(Map.of("text", userPrompt)));
        requestBody.put("contents", List.of(userContent));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("responseMimeType", "application/json");
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("User-Agent", "aistudio-build");

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        int attempts = 0;
        while (attempts < maxRetries) {
            attempts++;
            try {
                ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, entity, String.class);
                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    return parseGeminiResponse(response.getBody());
                }
            } catch (HttpServerErrorException.ServiceUnavailable e) {
                log.warn("Gemini returned 503 Service Unavailable on attempt {}/{}. Retrying in {}ms...",
                        attempts, maxRetries, retryBackoffMs * attempts);
                if (attempts >= maxRetries) {
                    throw e;
                }
                Thread.sleep(retryBackoffMs * attempts);
            } catch (Exception e) {
                if (attempts >= maxRetries) {
                    throw e;
                }
                Thread.sleep(500);
            }
        }
        throw new RuntimeException("Exceeded max retries calling Gemini API");
    }

    private EvaluationResponse parseGeminiResponse(String jsonString) {
        try {
            JsonNode root = objectMapper.readTree(jsonString);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode textNode = candidates.get(0).path("content").path("parts").get(0).path("text");
                String rawText = textNode.asText().trim();
                // Clean up any stray markdown fences
                if (rawText.startsWith("```json")) {
                    rawText = rawText.substring(7);
                }
                if (rawText.startsWith("```")) {
                    rawText = rawText.substring(3);
                }
                if (rawText.endsWith("```")) {
                    rawText = rawText.substring(0, rawText.length() - 3);
                }
                rawText = rawText.trim();

                JsonNode parsedData = objectMapper.readTree(rawText);
                String status = parsedData.path("status").asText("APPROVED").toUpperCase();
                int score = parsedData.path("culturalScore").asInt(85);
                String title = parsedData.path("gatekeeperTitle").asText("Chiến Thần Phối Đồ Hoàng Gia");
                String feedback = parsedData.path("feedback").asText("Bộ đồ này slay dính dách, chị duyệt liền tay!");
                String culturalNotes = parsedData.path("culturalNotes").asText("Nét đẹp trang phục truyền thống Việt được gìn giữ đúng tinh thần.");
                String stylingTips = parsedData.path("stylingTips").asText("Thêm phụ kiện vòng cổ bạc hoặc clutch thổ cẩm để tổng thể nổi bật hơn.");
                
                List<String> hashtags = new ArrayList<>();
                JsonNode hashNode = parsedData.path("hashtags");
                if (hashNode.isArray()) {
                    hashNode.forEach(h -> hashtags.add(h.asText()));
                } else {
                    hashtags.addAll(List.of("#VietPhucRemix", "#AuditionFashion", "#GenZHeritage"));
                }

                return new EvaluationResponse(status, score, title, feedback, culturalNotes, stylingTips, hashtags, "APPROVED".equalsIgnoreCase(status));
            }
        } catch (Exception e) {
            log.error("Failed to parse Gemini response: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Cultural Intelligence Fallback Engine
     */
    private EvaluationResponse generateHeuristicEvaluation(EvaluationRequest request, List<WardrobeItem> items) {
        String event = request.getEvent().toLowerCase();
        boolean hasOuterwear = items.stream().anyMatch(i -> "OUTERWEAR".equalsIgnoreCase(i.getCategory()));
        boolean hasNhatBinh = items.stream().anyMatch(i -> i.getName().toLowerCase().contains("nhật bình"));
        boolean hasNguThan = items.stream().anyMatch(i -> i.getName().toLowerCase().contains("ngũ thân"));
        boolean hasYem = items.stream().anyMatch(i -> i.getName().toLowerCase().contains("yếm"));
        boolean hasGuocMoc = items.stream().anyMatch(i -> i.getName().toLowerCase().contains("guốc"));

        int score = 88;
        String status = "APPROVED";
        String title;
        String feedback;
        String culturalNotes;
        String stylingTips;
        List<String> hashtags = new ArrayList<>(List.of("#VietPhucRemix", "#AuditionVietPhuc", "#SlayDiSan"));

        if (event.contains("bùi viện") || event.contains("quán bar") || event.contains("quẩy") || event.contains("club")) {
            if (hasNhatBinh) {
                score = 68;
                status = "APPROVED";
                title = "Tiểu Thư Triều Đình Đi Quẩy Dính Dách";
                feedback = "Chị Gatekeeper ngã ngửa vì độ chịu chơi! Áo Nhật Bình vốn là lễ phục quý tộc nhà Nguyễn, đem ra Bùi Viện quẩy thì hơi liều đấy bà nội, nhưng may là bà biết khoác ngoài layer cực kỳ sang chảnh! Cứ tưởng dính 'red flag' mà slay không lối thoát!";
                culturalNotes = "Áo Nhật Bình có cổ áo hình chữ nhật viền thêu hoa văn ngũ hành triều Nguyễn. Khi remix đi dạo phố đêm, hãy nhớ cài đủ dải cúc ngọc trước ngực để tôn sự trang nhã.";
                stylingTips = "Thay đôi cao gót bằng đôi sneaker retro hoặc boots da cao cổ để bước đi trên phố Tây không bị đau chân mà vẫn chất phát ngất!";
                hashtags.add("#BuiVienChic");
            } else {
                score = 92;
                title = "Gen-Z Cyber Heritage Icon";
                feedback = "Outfit quá keo! Sự giao thoa giữa nét phóng khoáng đường phố và phom dáng áo truyền thống làm chị không thể không ấn nút APPROVED!";
                culturalNotes = "Trang phục truyền thống của người Việt luôn đề cao sự uyển chuyển và chất liệu lụa tơ tằm tự nhiên thoáng mát.";
                stylingTips = "Đeo thêm kính râm gọng kim loại Y2K và túi xách baguette thổ cẩm để tạo điểm nhấn hiện đại.";
            }
        } else if (event.contains("cưới") || event.contains("tiệc") || event.contains("đám cưới")) {
            score = 95;
            title = "Khách Mời 10 Điểm Không Có Nhưng";
            feedback = "Eo ôi đỉnh nóc kịch trần bay phấp phới! Mặc set này đi ăn cưới thì lấn lướt cô dâu chú rể nhưng cực kỳ lịch sự và quý phái. Đạt chuẩn con dâu nhà lành thời đại 4.0!";
            culturalNotes = "Áo ngũ thân và áo tấc là biểu tượng của sự đoan trang, ngũ thân tượng trưng cho tứ thân phụ mẫu và chính bản thân người mặc.";
            stylingTips = "Cài thêm một chiếc trâm cài tóc xà cừ hoặc chuỗi ngọc trai cổ điển để thần thái thêm phần thanh tao.";
            hashtags.add("#DammCuoiThanhLich");
        } else if (event.contains("rap") || event.contains("concert")) {
            score = 94;
            title = "Chiến Thần Rap Viet Phuc Flow";
            feedback = "10 điểm không có nhưng! Mang áo ngũ thân tay chẽn phối quần ống thụng và phụ kiện streetwear đi quẩy concert rap thì chị xin quỳ về độ sáng tạo. Over hợp!";
            culturalNotes = "Áo ngũ thân tay chẽn thế kỷ 19 rất ôm gọn và tiện di chuyển, cực kỳ lý tưởng để biến tấu thành streetwear năng động.";
            stylingTips = "Mix cùng dây chuyền xích bạc bản lớn phong cách Hip-Hop kết hợp khánh bạc truyền thống.";
            hashtags.add("#RapVietPhuc");
        } else {
            score = 90;
            title = "Đại Sứ Di Sản Thế Hệ Mới";
            feedback = "Gu thẩm mỹ cực mượt! Các chi tiết cổ áo, vạt áo truyền thống ôm trọn tinh thần Việt nhưng tinh thần lại tràn đầy năng lượng Gen-Z. Chị duyệt thẳng cánh!";
            culturalNotes = "Nét đẹp trang phục Việt Nam nằm ở độ rủ tự nhiên của tà áo, đường may giấu chỉ tinh xảo và sự khiêm nhường tao nhã.";
            stylingTips = "Có thể xắn nhẹ gấu tay áo hoặc khoác hờ tà ngoài để tạo cảm giác tự nhiên thoải mái hơn.";
        }

        return new EvaluationResponse(status, score, title, feedback, culturalNotes, stylingTips, hashtags, "APPROVED".equalsIgnoreCase(status));
    }
}
