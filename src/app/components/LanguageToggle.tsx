import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";

export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const english = i18n.resolvedLanguage === "en";
  const nextLanguage = english ? "es" : "en";
  const label = english ? t("common.spanish") : t("common.english");

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void i18n.changeLanguage(nextLanguage)}
      aria-label={`${t("common.language")}: ${label}`}
      title={`${t("common.language")}: ${label}`}
      className="h-9 rounded-lg border-blue-100 bg-blue-50/70 px-3 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
    >
      <Languages className="h-4 w-4" />
      <span className={compact ? "sr-only" : "hidden lg:inline"}>{english ? "ES" : "EN"}</span>
    </Button>
  );
}
