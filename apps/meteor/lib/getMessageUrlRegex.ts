export const getMessageUrlRegex = (): RegExp =>
/(?:\(|'|^)(\w+:\/\/[-A-Za-z0-9\.]+(:\d+)?(\/[-\+=&?:%#\.\/\w]*)?)(?:\)|'|$)|(?:\(|'|^)(https?:\/\/[-A-Za-z0-9\.]+(:\d+)?(\/[-\+=&?:%#\.\/\w]*)?)(?:\)|'|$)/g;
