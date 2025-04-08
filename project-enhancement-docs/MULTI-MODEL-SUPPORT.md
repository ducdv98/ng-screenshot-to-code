# Feature Enhancement Plan: Multi-Model Support & User API Keys

*Goal: Allow users to select from different supported Vision Language Models (VLMs) for code generation and optionally provide their own API keys for the selected service, enabling flexibility and user-managed cost control.*

## Rationale

*   **Flexibility:** Different models (Gemini, GPT-4V, Claude variants) have varying strengths, weaknesses, costs, and generation styles. Users may prefer one over another for specific tasks or based on their own testing.
*   **Cost Management:** Processing images with VLMs can be expensive. Allowing users to provide their own API keys shifts the direct API usage cost from the application provider to the individual user for their requests.
*   **Access:** Users might already have accounts and credits with specific AI providers.

## Key Components

### 1. Backend Changes

*   **Location:** `backend/app/services/ai_service.py`, `backend/app/api/v1/endpoints/generate_image.py`, `backend/app/models/`, `backend/app/core/config.py`
*   **Steps:**
    *   **Abstract AI Service:** Refactor `ai_service.py` to support multiple AI clients.
        *   Create a base class or use conditional logic based on the selected model (`gemini`, `openai`, `anthropic`).
        *   Each specific implementation will handle the unique API calls, request formatting, and response parsing for its respective service (Google AI SDK, OpenAI SDK, Anthropic SDK).
    *   **Modify API Endpoint (`/api/v1/generate-from-image`):**
        *   Update the request model (`backend/app/models/image_input.py`) to accept optional fields:
            *   `selected_model` (e.g., Enum: `GEMINI_PRO`, `GEMINI_FLASH`, `GPT_4_VISION`, `CLAUDE_3_OPUS`, `CLAUDE_3_SONNET`, `CLAUDE_3_HAIKU`)
            *   `user_api_key` (string, sensitive)
    *   **Dynamic Client Initialization:** In `ai_service.py` or the endpoint logic, instantiate the correct AI client using the `user_api_key` provided in the request. **Crucially, handle the user-provided key securely per-request. Do NOT log it or store it persistently unless implementing full user accounts with encryption.**
    *   **Configuration (`config.py`):** Decide on the strategy for backend-configured keys:
        *   *Option A (User Keys Only):* Remove default keys from backend config. If no key is provided by the user, return an error.
        *   *Option B (Backend Keys as Default/Fallback):* Keep backend keys. If the user provides a key, use it. If not, use the backend's default key for the selected (or default) model. *Requires clear communication to the user about which key is being used.*
        *   *Option C (Hybrid):* Support both, perhaps allowing users to *choose* whether to use their key or the system's (if available).
    *   **Error Handling:** Implement specific error handling for invalid API keys, model access permissions, rate limits, etc., for each supported AI provider. Return clear error messages to the frontend.
    *   **Update Dependencies:** Ensure all necessary SDKs (`google-generativeai`, `openai`, `anthropic`) are listed in `requirements.txt`.

### 2. Frontend Changes

*   **Location:** `frontend/src/app/pages/generator-page/`, `frontend/src/app/services/api.service.ts`, `frontend/src/app/models/`
*   **Steps:**
    *   **Add UI Controls:** In `GeneratorPageComponent`, add new form elements:
        *   A `MatSelect` dropdown allowing the user to choose the desired VLM model from the supported list.
        *   A `MatInput` field (type `password` recommended for basic masking) for the user to enter their API key. Add appropriate labels and potentially tooltips (`matTooltip`) explaining the purpose and linking to where users can get keys.
    *   **Update `ApiService`:**
        *   Modify the `generateCodeFromImage` method signature to accept `selectedModel` and `userApiKey` as optional parameters.
        *   Update the HTTP request payload to include these new fields when calling the backend endpoint.
    *   **State Management:**
        *   Manage the selected model and the entered API key in the `GeneratorPageComponent`'s state.
        *   **API Key Handling Strategy:**
            *   *Per-Generation Entry (Simplest, Safest):* Require the user to enter the key every time they generate. Clear the field after the request.
            *   *Session Storage (Convenient, Moderate Risk):* Store the key in `sessionStorage` so it persists for the browser tab session but is cleared when the tab closes. Add a disclaimer about browser storage risks.
            *   *Local Storage (Most Convenient, Higher Risk):* Store the key in `localStorage`. Persists across browser sessions. **Strongly advise against this for sensitive keys unless the user explicitly opts-in with clear warnings about XSS risks.**
            *   Implement a "Clear Key" button if storing temporarily.
    *   **Conditional UI:** Consider disabling the API key input if the user selects a model that relies on a system-provided key (if using Option B/C in backend). Clearly indicate when a user key vs. a system key will be used.

### 3. Documentation Updates

*   **README/User Guide:** Explain how to select models and use personal API keys. Clarify the benefits (cost control) and responsibilities (key security).
*   **.env.example:** Update if backend keys are still used as fallbacks/defaults.
*   **Code Comments:** Add comments regarding secure handling of user-provided API keys in the backend.

## Placement in Roadmap

This feature is a significant enhancement. It could be:

*   **Part of Phase 4 (Polish & Advanced Features):** Treated as an advanced feature after core image and Figma functionality are stable.
*   **Integrated Earlier (e.g., alongside Phase 2/3):** If user cost management or model flexibility is deemed a high priority early on.

Given the complexity, **Phase 4** seems like a reasonable placement unless driven by strong user demand earlier.

---

Add this `MULTI-MODEL-SUPPORT.md` to your project documentation. You should also update `ROADMAP.md` to include "Multi-Model Support & User API Keys" as a planned feature, likely under Phase 4 or as a distinct feature track.