import { KioskLayout } from "../../../components/kiosk/KioskLayout";

export default function CheckinLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <KioskLayout>{children}</KioskLayout>;
}
