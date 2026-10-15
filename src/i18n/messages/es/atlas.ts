import en from "../en/atlas";

// The Atlas of Silent Worlds is English only for now; translations arrive once its text settles.
const messages: Record<keyof typeof en, string> = { ...en };

export default messages;
