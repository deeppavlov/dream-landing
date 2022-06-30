# Dream Landing

This repository is home to the Dream landing and demo page.

## Development

First, run the development server:

```bash
npm run dev
```

then open [http://localhost:3000](http://localhost:3000).

You can use the command

```bash
npm run dev:msw
```

to mock dream endpoints in development. You can edit the mock handlers in `mocks/browser.ts`.

Run tests for utility functions:
```bash
npm test
```

## Documentation

This project uses [Next.JS](https://nextjs.org/docs) and TypeScript.

## Next steps

 1. Read through this documentation and the codebase
 2. Finish implementing the surveys feature
    1. Create the UI component, for the floating window in `components/`
    2. You could probably modify `ActionBtn.tsx` to work as the answer button in the survey window
    3. Create a hook in `hooks/` for gathering the `ClientContext` and querying the survey endpoint on every bot reply
    4. Once the database is ready, the Agent folks, will probably provide a Dream endpoint for saving survey results, so that could be used directly from the client
    5. (Optionally) we could cut down on client side requests by grouping together sending messages and querying for active surveys into a single endpoint
 3. If it's fixed, add back utterance ratings
 4. If there are no other urgent tasks:
    1. Shared types could be moved to one file
    2. `useChat` and the overall state management is pretty messy. A central store could be introduced + instead of saving the message history in local storage, it could be fetched from the API on load.
    3. Next.js and React are huge dependencies (about ~60% of the final bundle), but we do not use heavily any specific feature from either. Theoritcally, the whole site could be ported to use Vite (and vite-plugin-ssr) instead of Next.js and Preact instead of React. Exploration of this can be found on the [`feat/optimize-load`](https://github.com/deepmipt/dream-landing/tree/feat/optimize-load) branch.

### Project structure:

 - `pages/`
   - `index.tsx` Main page with chat window and sidebar
   - `chat.module.css` Styles for `index.tsx`
   - `shared.tsx` The page users see when they visit a shared dialog
   - `shared.module.css` Styles for `shared.tsx`
   - `api/`
     - `preview.ts` Generates an image preview for a shared dialog
     - `survey.ts` Given a user context return active survey, if any
- `components/` See [Components](#components)
- `public/` Public static assets (fonts, logo, favicon)
- `styles/`
    - `global.css` Global styles (style reset)
- `hooks/`
    - `useChat.ts` Hook that keeps the chat state, sends and receives messages
    - `useOnSmallerScreen.ts` Hook that monitors screen size
    - `usePost.ts` A minimal fetch hook for post requests
    - `useStored.ts` Hook for localstorage
- `utils/`
    - `analytics.ts` Google Analytics wrappers
    - `renderChat.ts` Render a list of messages to an image (in NodeJS context)
    - `shareUrl.ts` Generate a share url for a list of messages or parse a shared url 
    - `surveyConfig.ts` Find a matching survey given a client context
- `surveys/` Survey specification files (see `survey-config-spec.yaml`)
- `mocks/`
  - `browser.ts` MSW mock handlers for Dream endpoints
- `survey-config-spec.yaml` An example for a survey config (not a valid config itself)

### Features overview

#### Chat 
The main purpose of the landing site is to allow users to chat with the Dream social bot. This is done through Dream's REST API:

 - `POST` https://7019.deeppavlov.ai/ - Get a reply from Dream
    - Request spec:
    ```ts
    {
        user_id: string; // User ID (generated on client side)
        payload: string; // Message text
    }
    ```
    - Response spec:
    ```ts
    {
        dialog_id: string; // ID of current dialog (generated on server side)
        utt_id: string; // ID of current utterance
        user_id: string; // User ID (same as the one we sent)
        response: string; // Response text
        active_skill: string; // Name of Dream skill that generated the repsonse
    }
    ```
 - `POST` https://7019.deeppavlov.ai/rating/dialog - Post a rating (1-5) for the dialog
    - Request spec:
    ```ts
    {
        user_id: string; // User ID
        rating: number; // Rating (1-5)
        dialog_id: string; // Dialog ID
    }
    ```
    - Response: empty on success
 - `GET` https://7019.deeppavlov.ai/api/dialogs/ - Get the chat history for the dialog
    - Response spec:
    ```ts
    {
        utterances: {
            utt_id: string;
            text: string;
            user: {
                user_type: "human" | "bot";
            };
        }[];
    }
    ```


Interfacing with this API is done in `hooks/useChat.ts`. This hook stores the user ID, dialog ID, chat history and the current rating. It saves the chat history (as well as the user/dialog ID) to local store, instead of fetching them from the API. This is because when the project's development started, the endpoint for fetching message history did not work reliably. Now that that is fixed, fetching messages instaed of storing should be experimented with.

Dream has (will have) multiple versions deployed, at the very least one for each supported language. The chat can handle this via the `version` search parameter, which is parsed in the `useChat` hook, and the consequently used to select the right API endpoint. Also the version id is used to prefix all keys in the local storage, so that a user can chat with multiple version without interference. The id for the default (English) version is an empty string, to remain backwards compatible with older deployments.

The main chat window is mostly implemented in `pages/index.tsx`. The chat history specifically is in `components/MessageHistory.tsx`, the individual chat bubbles in `components/MessageBubble.tsx`, and the sidebar in `components/Sidebar.tsx`.

#### Sharing

An important feature of the site is sharing dialogs or parts of them on social media. The client side generates unique sharing URLs via the utilities in `utils/shareUrl.ts`, which point to the `pages/shared.tsx` page, and encode the dialog id, the bot version, and the range of messages to be shown.

The `pages/shared.tsx` route fetches the shared dialog from the API and renders the selected messages with the `components/MessageHistory.tsx` component, the same one used in the main chat view.

The `pages/api/preview.ts` endpoint renders shared dialogs onto a canvas on the server and returns it as an image, to be used as thumbnail on social media shares (the necessary open graph tags are configured in `pages/shared.tsx`, since that's the site the platforms crawl). The actual rendering is implemented in `utils/renderChat.ts`.

**IMPORTANT:** If the design of the chat bubbles changes in the future, it is neccessary to update the canvas rendering logic as well in `utils/renderChat.ts`

#### Rating & feedback

It is possible to give a 1-5 rating to the overall dialog with Dream. The UI for the stars is in `components/StarsRating.tsx`, while the logic for posting the rating is in `useChat`.

When clicking the "leave feedback" link, the popup defined in `components/FeedbackPopup.tsx` shows up. The textual feedback entered here is currently saved to a Google Sheet, but this should be moved to the Dream database ASAP (consult with Maxim Talimanchuk). 

Giving a rating (or reaction) to each individual bot reply should also be possible, but due to an underlying bug in Dream, it is currently disabled. The UI is there, though and completely functional, only lines 80-87 need to be uncommented in `components/MessageBubble.tsx`. Timeline of fix to be discussed with Fedor Ignatov.

#### Surveys

Conducting randomly sampled surveys amongst the users while they are chatting should be possible. The currently running surveys are defined by YAML specification files, located in the `surveys/` folder, see `survey-config-spec.yaml` for an example, or `utils/surveyConfig.schema.json` for the exact JSON Schema.

The client queries the `pages/api/survey.ts` endpoint after every bot message received (if it's not already showing a survey), sending along some information about the user and the current conversation (see `ClientContext` in `utils/surveyConfig.ts`). The endpoint then decides, based on random chance and the `ClientContext`, which survey to send back, if any.

On the client side, the active survey, if any, should be shown in a floating window (see Figma design), and should disappear after the user answered, closed it, or certain time has elapsed, and the results, or lack thereof, sent back.

Currently, only the survey configs and the query endpoint are done. The UI component, and the endpoint for saving results remain to be done. Ideally, these survey results should be saved in the same database where feedback is saved, so it also needs to be coordinated with Maxim Talimanchuk.