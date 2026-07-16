type InputFieldType = "text" | "email" | "date" | "tel" | "file";
type FieldType = InputFieldType | "textarea" | "choice";
type PaymentType = "cart" | "email";

export type ServiceField = {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  hint?: string;
  hintImage?: string;
  options?: { value: string; label: string; price: number }[];
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
    price: 0,
    paymentType: "email",
    ctaLabel: "Enviar solicitud",
    fields: [
      {
        name: "productType",
        label: "Tipo de producto",
        type: "choice",
        required: true,
        options: [
          { value: "estufa", label: "Estufa", price: 60 },
          { value: "termoestufa", label: "Termoestufa", price: 100 },
        ],
      },
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
    slug: "activacion-garantia-telematica",
    title: "Activación de la garantía oficial telemática",
    price: 49,
    paymentType: "cart",
    ctaLabel: "Pagar 49 € (IVA incluida)",
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
        label:
          "Foto o PDF de la etiqueta que figura en la parte trasera del producto",
        type: "file",
        required: true,
        hint: "Sugerencia",
        hintImage: "/images/hints/etiqueta.png",
      },
      {
        name: "invoiceFile",
        label: "Factura de compra del producto",
        type: "file",
        required: true,
        hint: "Sugerencia",
      },
      {
        name: "backPhoto",
        label: "Foto del retro",
        type: "file",
        required: true,
        hint: "Sugerencia",
        hintImage: "/images/hints/retro.jpg",
      },
      {
        name: "outsidePhoto",
        label: "Foto del exterior",
        type: "file",
        required: true,
        hint: "Sugerencia",
        hintImage: "/images/hints/foto-exterior.jpg",
      },
      {
        name: "widePhoto",
        label: "Foto con encuadre general a campo abierto",
        type: "file",
        required: true,
        hint: "Sugerencia",
      },
      {
        name: "installationSketch",
        label: "Croquis de la instalación (opcional)",
        type: "file",
        required: false,
        hint: "Sugerencia",
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
