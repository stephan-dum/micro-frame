import useService from "@micro-frame/plugin-react/useService";
import { TranslationService } from "@xxxs-shop/services-translations/types";

const useTranslations = (translations: string[], scope?: string) => useService<TranslationService>('translations').getTranslations(translations, scope);

export default useTranslations;
