import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/features/i18n/LanguageContext";

export const ConfirmDialog = ({ open, onOpenChange, title, description, onConfirm, confirm, cancelText = "Cancel", testid }) => <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent className="local-dialog" data-testid={`${testid}-dialog`}><AlertDialogHeader><AlertDialogTitle data-testid={`${testid}-title`}>{title}</AlertDialogTitle><AlertDialogDescription data-testid={`${testid}-description`}>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="button button-secondary" data-testid={`${testid}-cancel`}>{cancelText}</AlertDialogCancel><AlertDialogAction className="button button-primary" onClick={onConfirm} data-testid={`${testid}-confirm`}>{confirm}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;

export const StatusBadges = ({ deal, prefix }) => {
  const { t } = useLanguage();
  const stockLabel = deal.status === "Sold" ? t("status.sold", "Sold") : t("status.in_stock", "In Stock");
  const rcLabel = deal.rc_status === "Completed" ? t("status.rc_completed", "RC Completed") : t("status.rc_pending", "RC Pending");
  return (
    <div className="local-status-stack">
      <span className={`status-pill ${deal.status === "Sold" ? "green" : "blue"}`} data-testid={`${prefix}-stock-status`}>{stockLabel}</span>
      <span className={`status-pill ${deal.rc_status === "Completed" ? "green" : "gold"}`} data-testid={`${prefix}-rc-status`}>{rcLabel}</span>
    </div>
  );
};