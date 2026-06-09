import type { RideType } from "@/types/database";
import type { Settings } from "@/types/database";

export const businessName = "Daniyal Transport";
export const receiptWhatsapp = "0301-2589603";

export const defaultCliftonPayment = {
  method: "Bank Transfer",
  accountTitle: "Israr Muhammad",
  bankName: "Meezan Bank",
  accountNumber: "1047 0109 2680 26",
  receiptWhatsapp,
  note: "Double side: Rs. 12,500\nSingle side: Rs. 7,500\nPay before the 10th.",
};

export const defaultLinkRoadPayment = {
  method: "EasyPaisa",
  accountTitle: "Israr Muhammad",
  bankName: "EasyPaisa",
  accountNumber: "0301-2589603",
  receiptWhatsapp,
  note: "AC Van\nSteel Town: Rs. 9,000\nBhains Colony: Rs. 13,000\nQuaidabad: Rs. 15,000\nFees will be charged during the leave of the University.",
};

export const cliftonRoute = {
  id: "clifton",
  name: "Gulshan-e-Hadeed to Clifton",
  drop: "Clifton",
  fees: {
    both_side: 12500,
    one_side: 7500,
  },
  pickups: [
    "Gulshan-e-Hadeed",
    "Steel Town",
    "Razzaqabad",
    "Bhens Colony",
    "Manzil Pump",
    "Quaidabad",
    "Malir",
    "Korangi Industrial Area",
    "Qayyumabad",
    "Defence (DHA)",
    "2 Talwar",
    "3 Talwar",
    "Park Towers",
    "Dolmen Mall",
    "Abdullah Shah Ghazi",
    "South City Hospital",
    "Ziauddin Hospital Clifton",
    "Landhi to Link Road Ziauddin",
  ],
  vans: ["VAN 1", "VAN 2", "VAN 3", "VAN 4", "VAN 5"],
};

export const linkRoadRoute = {
  id: "link-road",
  name: "Ziauddin Link Road AC Van",
  drop: "Ziauddin Link Road",
  feesByPickup: {
    Landhi: 15000,
    "Shah Latif Town": 15000,
    Razzaqabad: 13000,
    "Port Qasim": 9000,
    "Steel Town": 9000,
    "Bhens Colony": 13000,
    Quaidabad: 15000,
    "Gulshan-e-Hadeed": 9000,
  },
  pickups: [
    "Landhi",
    "Quaidabad",
    "Bhens Colony",
    "Shah Latif Town",
    "Razzaqabad",
    "Port Qasim",
    "Steel Town",
    "Gulshan-e-Hadeed",
  ],
  vans: ["Ac Hiace 1", "Ac Hiace 2", "Ac Hiace 3", "Ac Hiace 3 (second)"],
};

export const daniyalPickupLocations = Array.from(
  new Set([...cliftonRoute.pickups, ...linkRoadRoute.pickups]),
);

export const daniyalDropLocations = [cliftonRoute.drop, linkRoadRoute.drop];

export function routeFromDrop(dropAddress: string | null | undefined) {
  return dropAddress === linkRoadRoute.drop ? linkRoadRoute : cliftonRoute;
}

export function calculateDaniyalFee({
  dropAddress,
  pickupAddress,
  rideType,
}: {
  dropAddress: string;
  pickupAddress: string;
  rideType: RideType;
}) {
  if (dropAddress === linkRoadRoute.drop) {
    return linkRoadRoute.feesByPickup[pickupAddress as keyof typeof linkRoadRoute.feesByPickup] ?? 0;
  }

  return cliftonRoute.fees[rideType] ?? cliftonRoute.fees.both_side;
}

export function paymentInstructionsForDrop(dropAddress: string | null | undefined) {
  if (dropAddress === linkRoadRoute.drop) {
    return [
      "Payment for Link Road route",
      "Bank Title: Israr Muhammad",
      "Easy Paisa number: 0301-2589603",
      "Monthly Fees:",
      "AC Van",
      "Steel Town towards Ziauddin Link Road: Rs. 9,000",
      "Bhains Colony towards Ziauddin Link Road: Rs. 13,000",
      "Quaidabad towards Ziauddin Link Road: Rs. 15,000",
      "Note: Fees will be charged during the leave of the University.",
    ].join("\n");
  }

  return [
    "Payment for Clifton route",
    "Bank Title: Israr Muhammad",
    "Meezan Bank number: 1047 0109 2680 26",
    "Monthly Fees:",
    "Double side: Rs. 12,500",
    "Single side: Rs. 7,500",
    "Note: Pay your van fees before 10 and always send screenshot of your bank receipt on WhatsApp number: 0301-2589603 when you pay van fees.",
  ].join("\n");
}

export const defaultPaymentInstructions = [
  paymentInstructionsForDrop(cliftonRoute.drop),
  "",
  paymentInstructionsForDrop(linkRoadRoute.drop),
].join("\n");

export function paymentInstructionsFromSettings(
  settings: Partial<Settings> | null | undefined,
  dropAddress: string | null | undefined,
) {
  if (dropAddress === linkRoadRoute.drop) {
    return buildPaymentInstructions({
      routeName: "Link Road route",
      method: settings?.link_road_payment_method ?? defaultLinkRoadPayment.method,
      accountTitle: settings?.link_road_account_title ?? defaultLinkRoadPayment.accountTitle,
      bankName: settings?.link_road_bank_name ?? defaultLinkRoadPayment.bankName,
      accountNumber: settings?.link_road_account_number ?? defaultLinkRoadPayment.accountNumber,
      receiptWhatsapp: settings?.link_road_receipt_whatsapp ?? defaultLinkRoadPayment.receiptWhatsapp,
      note: settings?.link_road_payment_note ?? settings?.link_road_payment_instructions ?? defaultLinkRoadPayment.note,
    });
  }

  return buildPaymentInstructions({
    routeName: "Clifton route",
    method: settings?.clifton_payment_method ?? defaultCliftonPayment.method,
    accountTitle: settings?.clifton_account_title ?? defaultCliftonPayment.accountTitle,
    bankName: settings?.clifton_bank_name ?? defaultCliftonPayment.bankName,
    accountNumber: settings?.clifton_account_number ?? defaultCliftonPayment.accountNumber,
    receiptWhatsapp: settings?.clifton_receipt_whatsapp ?? defaultCliftonPayment.receiptWhatsapp,
    note: settings?.clifton_payment_note ?? settings?.clifton_payment_instructions ?? defaultCliftonPayment.note,
  });
}

export function receiptWhatsappForDrop(
  settings: Partial<Settings> | null | undefined,
  dropAddress: string | null | undefined,
) {
  return dropAddress === linkRoadRoute.drop
    ? settings?.link_road_receipt_whatsapp ?? defaultLinkRoadPayment.receiptWhatsapp
    : settings?.clifton_receipt_whatsapp ?? defaultCliftonPayment.receiptWhatsapp;
}

function buildPaymentInstructions({
  routeName,
  method,
  accountTitle,
  bankName,
  accountNumber,
  receiptWhatsapp,
  note,
}: {
  routeName: string;
  method: string;
  accountTitle: string;
  bankName: string;
  accountNumber: string;
  receiptWhatsapp: string;
  note: string;
}) {
  return [
    `Payment for ${routeName}`,
    `Method: ${method}`,
    `Account title: ${accountTitle}`,
    `Bank / Wallet: ${bankName}`,
    `Account / Number: ${accountNumber}`,
    receiptWhatsapp ? `Send screenshot on WhatsApp: ${receiptWhatsapp}` : "",
    note,
  ].filter(Boolean).join("\n");
}
