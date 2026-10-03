import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useLanguage } from "@/features/i18n/LanguageContext";
import { areVehicleAndSellerComplete } from "./dealModel";

export const ConfirmDialog = ({ open, onOpenChange, title, description, onConfirm, confirm, cancelText = "Cancel", testid }) => <AlertDialog open={open} onOpenChange={onOpenChange}><AlertDialogContent className="local-dialog" data-testid={`${testid}-dialog`}><AlertDialogHeader><AlertDialogTitle data-testid={`${testid}-title`}>{title}</AlertDialogTitle><AlertDialogDescription data-testid={`${testid}-description`}>{description}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="button button-secondary" data-testid={`${testid}-cancel`}>{cancelText}</AlertDialogCancel><AlertDialogAction className="button button-primary" onClick={onConfirm} data-testid={`${testid}-confirm`}>{confirm}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;

export const StockBadge = ({ deal, prefix }) => {
  const { t } = useLanguage();
  const isOut = deal.status === "Out of Stock" || deal.status === "Sold";
  const stockLabel = deal.status === "Sold"
    ? t("status.sold", "Sold")
    : isOut
    ? t("status.out_of_stock", "Out of Stock")
    : t("status.in_stock", "In Stock");
  return (
    <span className={`status-pill ${deal.status === "Sold" ? "green" : isOut ? "red" : "blue"}`} data-testid={`${prefix}-stock-status`}>
      {stockLabel}
    </span>
  );
};

export const StatusBadges = ({ deal, prefix, onlyRc = false }) => {
  const { t } = useLanguage();
  const detailsComplete = areVehicleAndSellerComplete(deal);
  const isTransferred = deal.rc_status === "Completed" || deal.rc_status === "Transferred";

  const rcOrDetailBadge = !detailsComplete ? (
    <span className="status-pill gold" data-testid={`${prefix}-details-status`}>
      {t("status.details_pending", "Details Pending")}
    </span>
  ) : (
    <span className={`status-pill ${isTransferred ? "green" : "gold"}`} data-testid={`${prefix}-rc-status`}>
      {isTransferred ? t("status.rc_transferred", "RC Transferred") : t("status.rc_pending", "RC Pending")}
    </span>
  );

  if (onlyRc) {
    return rcOrDetailBadge;
  }

  const isOut = deal.status === "Out of Stock" || deal.status === "Sold";
  const stockLabel = deal.status === "Sold" ? t("status.sold", "Sold") : isOut ? t("status.out_of_stock", "Out of Stock") : t("status.in_stock", "In Stock");
  return (
    <div className="local-status-stack">
      <span className={`status-pill ${deal.status === "Sold" ? "green" : isOut ? "red" : "blue"}`} data-testid={`${prefix}-stock-status`}>{stockLabel}</span>
      {rcOrDetailBadge}
    </div>
  );
};