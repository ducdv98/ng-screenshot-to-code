# Development Plan: Phase 3 Figma Integration

*Goal: Add Figma designs as a primary input source for code generation, allowing users to convert Figma layouts directly into Angular Material/Tailwind components.*

This phase introduces a major new capability alongside the existing image-to-code feature.

## Tasks

### 1. Figma API Setup & Authentication

*   **Goal:** Allow the application to securely access Figma file data on behalf of the user.
*   **Location:** Backend (`backend/app/core/config.py`, potentially new auth routes/logic), Frontend (`frontend/src/app/components/figma-input/`, `frontend/src/app/services/api.service.ts`).
*   **Steps:**
    *   **Register Figma App:** Create an application registration on the Figma website to obtain OAuth credentials (client ID, client secret) if implementing OAuth.
    *   **Choose Auth Method:**
        *   **Option A (Simpler):** Allow users to input their Figma Personal Access Token and the Figma File URL directly in the frontend UI. Store/handle the token securely *only* for the duration of the request on the backend.
        *   **Option B (Better UX):** Implement the Figma OAuth 2.0 flow. This requires backend routes to handle the redirect URI, exchange the code for an access token, and securely store/manage the token (potentially associating it with a user session or account if implementing user logins later).
    *   **Backend Configuration:** Add configuration variables (`FIGMA_CLIENT_ID`, `FIGMA_CLIENT_SECRET` if using OAuth) to `.env` and `backend/app/core/config.py`.
    *   **Frontend UI:** Create `FigmaInputComponent` (`frontend/src/app/components/figma-input/`) with fields for Figma URL and Token (Option A) or an "Authorize Figma" button (Option B).

### 2. Backend Figma Processing

*   **Goal:** Fetch and parse the relevant data from a specified Figma file using the Figma API.
*   **Location:** Backend (`backend/app/api/v1/endpoints/generate_figma.py`, `backend/app/services/figma_service.py`, `backend/app/models/figma_input.py`).
*   **Steps:**
    *   **Add Dependency:** Install a Figma API client library (e.g., `pip install figma-py` or use `requests` directly).
    *   **Create API Endpoint:** Define a new endpoint, e.g., `POST /api/v1/generate-from-figma`, in `generate_figma.py`. It should accept the Figma file URL and the access token (or handle fetching it via OAuth session). Use Pydantic models (`figma_input.py`) for request validation.
    *   **Create Figma Service:** Implement `FigmaService` (`backend/app/services/figma_service.py`).
        *   Method `get_figma_file_data(file_url: str, token: str)`:
            *   Parse the `file_key` from the `file_url`.
            *   Use the Figma API client/`requests` to call the `GET /v1/files/:file_key` endpoint, passing the token in the `X-Figma-Token` header.
            *   Handle potential API errors (invalid token, not found, rate limits).
            *   Return the parsed JSON response (containing the document node tree).
    *   **Endpoint Logic:** The endpoint will call the `FigmaService` to get the data, then pass it to the `CodeGeneratorService` (potentially a new method `generate_code_from_figma_data`).

### 3. Develop Figma-to-Code Mapping Logic (Core Challenge)

*   **Goal:** Translate the structured Figma node tree and style information into Angular component code (`.ts`, `.html`, `.scss`) using Angular Material and TailwindCSS.
*   **Location:** Primarily `backend/app/services/code_generator.py`. This will likely require significant new logic or helper functions/classes.
*   **Steps:**
    *   **Understand Figma Structure:** Familiarize with the Figma API response structure (Document -> Canvas -> Frame/Component/Instance -> Children [Text, Rectangle, Vector, Group, etc.]). Pay attention to properties like `type`, `name`, `children`, `fills`, `strokes`, `effects`, `layoutMode` (HORIZONTAL/VERTICAL for Auto Layout), `itemSpacing`, `paddingLeft`/`Right`/`Top`/`Bottom`, `primaryAxisAlignItems`, `counterAxisAlignItems`, `style` (references to shared styles), `textAutoResize`, etc.
    *   **Implement Recursive Parser:** Create a function that traverses the Figma node tree recursively, starting from a target Frame or Component node selected by the user (or the first Frame on the first Canvas).
    *   **Node Type Mapping:** Define mappings from Figma node types to HTML tags / Angular Material components:
        *   `FRAME` with Auto Layout (`layoutMode`): `div` with Tailwind Flexbox/Grid classes (`flex`, `flex-col`, `grid`, `gap-`, `p-`, `justify-`, `items-`).
        *   `TEXT`: `p`, `span`, `h1`-`h6` (potentially based on font size/weight). Apply Tailwind typography classes (`text-lg`, `font-bold`, `text-gray-700`).
        *   `RECTANGLE`, `ELLIPSE`: `div` or potentially map to Material components if structure suggests it (e.g., `RECTANGLE` + `TEXT` = `mat-button`, `FRAME` with fill/stroke/effect = `mat-card`). Apply background color (`bg-`), border (`border`, `border-`), border radius (`rounded-`), shadow (`shadow-`) Tailwind classes based on `fills`, `strokes`, `effects`.
        *   `INSTANCE` (Component Instance): Attempt to map to a corresponding Angular component *if* a predefined mapping exists, otherwise parse its internal structure.
        *   *Start simple (Frames, Text, Rectangles) and add more complex mappings iteratively.*
    *   **Style Mapping:**
        *   **Colors:** Map `fills.color` (RGBA) and `strokes.color` (RGBA) to Tailwind `bg-`, `text-`, `border-` classes. Handle opacity. Consider using CSS variables if colors aren't standard Tailwind palette colors.
        *   **Typography:** Map `style.fontSize`, `style.fontWeight`, `style.fontFamily`, `style.lineHeightPx`, `style.textAlignHorizontal` to Tailwind `text-`, `font-`, `leading-`, `text-` classes.
        *   **Layout (Auto Layout):** Map `layoutMode` (HORIZONTAL/VERTICAL) to `flex`/`flex-col`. Map `itemSpacing` to `gap-`. Map padding properties to `p-`, `px-`, `py-`, `pt-`, etc. Map alignment properties (`primaryAxisAlignItems`, `counterAxisAlignItems`) to `justify-` and `items-`.
        *   **Effects:** Map `effects` (e.g., `DROP_SHADOW`) to Tailwind `shadow-` classes.
    *   **Code Generation:** Assemble the `.html` string based on the parsed structure and mapped styles/classes. Generate a basic `.ts` component file and an `.scss` file (primarily for `@tailwind` directives).
    *   **Iterative Refinement:** This mapping logic will require significant testing and refinement based on various Figma design patterns.

### 4. Frontend UI & Integration

*   **Goal:** Connect the frontend UI to the new backend Figma processing endpoint.
*   **Location:** `frontend/src/app/pages/generator-page/`, `frontend/src/app/components/figma-input/`, `frontend/src/app/services/api.service.ts`.
*   **Steps:**
    *   **Add Figma Input:** Integrate the `FigmaInputComponent` into the `GeneratorPageComponent`.
    *   **Update `ApiService`:** Add a new method `generateCodeFromFigma(fileUrl: string, token?: string)` (token might be handled differently if using OAuth) to call the `POST /api/v1/generate-from-figma` backend endpoint.
    *   **Connect UI:** In `GeneratorPageComponent`, call the new `ApiService` method when the user submits the Figma URL (and token, if applicable). Handle the response containing the generated code and display it using the `CodeViewerComponent` and `PreviewPaneComponent`.

---