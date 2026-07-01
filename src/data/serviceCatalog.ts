type InputFieldType = "text" | "email" | "date" | "tel" | "file";
type FieldType = InputFieldType | "textarea";
type PaymentType = "cart" | "email";

export type ServiceField = {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
};

export type ServiceCatalogItem = {
  slug: string;
  title: string;
  price: number;
  paymentType: PaymentType;
  ctaLabel: string;
  fields: ServiceField[];
};

export const VAT_RATE = 0.21;

export const serviceCatalog: ServiceCatalogItem[] = [
  {
    slug: "puesta-en-marcha-presencial",
    title: "Puesta en marcha presencial",
    price: 109.99,
    paymentType: "email",
    ctaLabel: "Enviar solicitud",
    fields: [
      {
        name: "fullName",
        label: "Nombre y apellidos",
        type: "text",
        required: true,
      },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "model", label: "Modelo", type: "text", required: true },
      {
        name: "purchaseDate",
        label: "Día de compra",
        type: "date",
        required: true,
      },
      {
        name: "serialNumber",
        label: "Número de serie",
        type: "text",
        required: true,
      },
      {
        name: "address",
        label: "Calle y número",
        type: "text",
        required: true,
      },
      {
        name: "postalCode",
        label: "Código postal",
        type: "text",
        required: true,
      },
      { name: "province", label: "Provincia", type: "text", required: true },
      { name: "phone", label: "Teléfono", type: "tel", required: true },
      {
        name: "comments",
        label: "Comentarios",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    slug: "mantenimiento",
    title: "Mantenimiento del producto",
    price: 0,
    paymentType: "email",
    ctaLabel: "Enviar solicitud",
    fields: [
      {
        name: "fullName",
        label: "Nombre y apellidos",
        type: "text",
        required: true,
      },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "model", label: "Modelo", type: "text", required: true },
      {
        name: "purchaseDate",
        label: "Día de compra",
        type: "date",
        required: true,
      },
      {
        name: "serialNumber",
        label: "Número de serie",
        type: "text",
        required: true,
      },
      {
        name: "address",
        label: "Calle y número",
        type: "text",
        required: true,
      },
      {
        name: "postalCode",
        label: "Código postal",
        type: "text",
        required: true,
      },
      { name: "province", label: "Provincia", type: "text", required: true },
      { name: "phone", label: "Teléfono", type: "tel", required: true },
      {
        name: "comments",
        label: "Comentarios",
        type: "textarea",
        required: false,
      },
    ],
  },
  {
    slug: "instalacion-telematica",
    title: "Instalación telemática",
    price: 5,
    paymentType: "cart",
    ctaLabel: "Pagar 5 € (IVA incluida)",
    fields: [
      {
        name: "fullName",
        label: "Nombre y apellidos",
        type: "text",
        required: true,
      },
      {
        name: "companyName",
        label: "Nombre de la empresa",
        type: "text",
        required: false,
      },
      {
        name: "countryRegion",
        label: "País / Región",
        type: "text",
        required: true,
      },
      {
        name: "address",
        label: "Calle y número",
        type: "text",
        required: true,
      },
      { name: "city", label: "Población", type: "text", required: true },
      {
        name: "provinceRegion",
        label: "Región / Provincia",
        type: "text",
        required: true,
      },
      {
        name: "postalCode",
        label: "Código postal",
        type: "text",
        required: true,
      },
      { name: "phone", label: "Teléfono", type: "tel", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "model", label: "Modelo", type: "text", required: true },
      {
        name: "purchasePlace",
        label: "Dónde ha comprado la estufa",
        type: "text",
        required: true,
      },
      {
        name: "serialNumber",
        label: "Número de serie",
        type: "text",
        required: true,
      },
      {
        name: "labelFile",
        label: "Foto o PDF de la etiqueta",
        type: "file",
        required: true,
      },
      {
        name: "invoiceFile",
        label: "Factura de compra",
        type: "file",
        required: true,
      },
      {
        name: "backPhoto",
        label: "Foto del retro",
        type: "file",
        required: true,
      },
      {
        name: "outsidePhoto",
        label: "Foto del exterior",
        type: "file",
        required: true,
      },
      {
        name: "widePhoto",
        label: "Foto con encuadre general a campo abierto",
        type: "file",
        required: true,
      },
      {
        name: "installationDescription",
        label: "Breve descripción de la instalación",
        type: "textarea",
        required: true,
      },
    ],
  },
];
