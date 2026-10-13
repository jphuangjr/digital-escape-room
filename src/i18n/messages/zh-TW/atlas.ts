import en from "../en/atlas";

// The Atlas of Silent Worlds is in staging and English only; translations arrive once its text settles.
const messages: Record<keyof typeof en, string> = { ...en };

export default messages;
