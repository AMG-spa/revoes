type InputFieldType = "text" | "email" | "date" | "tel" | "file";
type FieldType = InputFieldType | "textarea" | "choice" | "modelSelect";
type PaymentType = "cart" | "email";

export type ServiceField = {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  hint?: string;
  hintImage?: string;
  // internalLabel: usata solo nella mail interna, mai mostrata sul sito
  // pubblico (es. per indicare il rivenditore senza scriverlo in chiaro sul sito).
  options?: {
    value: string;
    label: string;
    price: number;
    internalLabel?: string;
  }[];
};

export type ServiceCatalogItem = {
  slug: string;
  title: string;
  price: number;
  paymentType: PaymentType;
  ctaLabel: string;
  fields: ServiceField[];
  // Nota piccola con asterisco subito sotto il titolo (in alto nella pagina).
  topNote?: string;
  // Nota mostrata dopo l'ultimo campo del form, prima del pulsante di invio.
  bottomNote?: string;
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
        name: "model",
        label: "Modelo",
        type: "modelSelect",
        required: true,
        options: [
          {
            value: "brico-mini6evo",
            label: "Mini6evo",
            internalLabel: "Brico Depot - Mini6evo",
            price: 45.41,
          },
          {
            value: "brico-canadian6l",
            label: "Canadian6l",
            internalLabel: "Brico Depot - Canadian6l",
            price: 45.41,
          },
          {
            value: "brico-next7",
            label: "Next7",
            internalLabel: "Brico Depot - Next7",
            price: 45.41,
          },
          {
            value: "brico-next9",
            label: "Next9",
            internalLabel: "Brico Depot - Next9",
            price: 45.41,
          },
          {
            value: "brico-egan9",
            label: "Egan9",
            internalLabel: "Brico Depot - Egan9",
            price: 45.41,
          },
          {
            value: "brico-pasilloplus10c",
            label: "Pasilloplus10c",
            internalLabel: "Brico Depot - Pasilloplus10c",
            price: 45.41,
          },
          {
            value: "brico-canadian12",
            label: "Canadian12",
            internalLabel: "Brico Depot - Canadian12",
            price: 45.41,
          },
          {
            value: "brico-canadian10n",
            label: "Canadian10N",
            internalLabel: "Brico Depot - Canadian10N",
            price: 45.41,
          },
          {
            value: "brico-steel12c",
            label: "Steel 12C",
            internalLabel: "Brico Depot - Steel 12C",
            price: 45.41,
          },
          {
            value: "leroy-hella7",
            label: "Hella7",
            internalLabel: "Leroy Merlin - Hella7",
            price: 60,
          },
          {
            value: "leroy-mannu9",
            label: "Mannu9",
            internalLabel: "Leroy Merlin - Mannu9",
            price: 60,
          },
          {
            value: "leroy-krone5",
            label: "Krone 5",
            internalLabel: "Leroy Merlin - Krone 5",
            price: 60,
          },
          {
            value: "leroy-krone7",
            label: "Krone7",
            internalLabel: "Leroy Merlin - Krone7",
            price: 60,
          },
        ],
      },
      {
        name: "fullName",
        label: "Nombre y apellidos",
        type: "text",
        required: true,
      },
      {
        name: "nif",
        label: "NIF (DNI/NIE)",
        type: "text",
        required: true,
      },
      { name: "email", label: "Email", type: "email", required: true },
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
      {
        name: "nif",
        label: "NIF (DNI/NIE)",
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
    topNote:
      "El servicio de activación de la garantía telemática es necesario para verificar que el producto es instalado de forma segura y que respete la normativa RITE vigente en España. Este servicio es totalmente telemático y es verificato por un equipo técnico especializado. En caso de que no sea posible la activación (instalación no conforme a la normativa/insegura), el servicio no es reembolsable.",
    bottomNote:
      "Recomendamos el ajuste del equipo, de forma presencial, por un SAT autorizado Revo, para un funcionamiento óptimo. Este servicio no está incluido en el pago por la activación de la garantía telemática oficial y es a cargo del usuario final en caso de que sea necesario.",
    fields: [
      {
        name: "fullName",
        label: "Nombre y apellidos",
        type: "text",
        required: true,
      },
      {
        name: "nif",
        label: "NIF (DNI/NIE)",
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
        hint: "Sube la factura de compra en PDF o foto, donde se ve la fetcha de compra.",
      },
      {
        name: "backPhoto",
        label: "Foto de la parte trasera",
        type: "file",
        required: true,
        hint: "Foto de la parte trasera de la estufa (parte trasera + conexión del conducto del humos).",
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
        hint: "Foto de toda la estufa junto con el espacio a su alrededor, no solo el aparato.",
      },
      {
        name: "installationSketch",
        label: "Croquis de la instalación (opcional)",
        type: "file",
        required: false,
        hint: "Un dibujo simple con las medidas aproximadas de la instalación, no hace falta que sea preciso.",
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
