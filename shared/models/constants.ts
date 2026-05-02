export const COLLECTION_CONFIG_FILE_NAME = 'pandora.config.yml';


export const COLLECTION_CONFIG_FILE_FORMAT_ERROR = `Ошибка при обработке файла конфигурации коллекции (${COLLECTION_CONFIG_FILE_NAME})`;

export const GENERAL_INFORMATION_WORKSPACE_ID =  'general';
export const GENERAL_INFORMATION_DESCRIPTION_TAB_ITEM_ID =  'description';

export const REQUEST_TAB_ITEM_DEFAULT_NAME =  'Без названия';

export const MIN_SIDEBAR_WIDTH_PX = 200;
export const MAX_SIDEBAR_WIDTH_PX = 500;
export const DEFAULT_SIDEBAR_WIDTH_PX = 400;

export const MIN_NAME_COLUMN_WIDTH_PX = 100;

export const BODY_KIND = {
  NONE: "none" as const,
  FILE: "file" as const,
  FORM_URL_ENCODED: "form-url-encoded" as const,
  MULTIPART_FORM: "multipart-form" as const,
  JSON: "json" as const,
  XML: "xml" as const,
  TEXT: "text" as const,
};

