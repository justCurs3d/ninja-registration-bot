export enum Companies {
    TechnoPlast = 'TechnoPlast',
    TechnoMega = 'TechnoMega',
    Alpha = 'Alpha',
    Economy = 'Economy',
    Olivir = 'Olivir',
}

export type OrderIdsResponse = {
    orderIds: number[];
};

export type MainQrResponse = {
    barcode: string;
    file: string;
};

export type OrdersResponse = {
    orders: OrderInfo[];
    next: number;
};

export type OrderInfo = {
    id: number;
    supplyId: string;
    article: string;
};

export type OrdersRequestParams = {
    limit: number;
    next: number;
    dateFrom: number;
    dateTo: number;
};

export type OrderWb = {
    scanPrice: number | null;
    orderUid: string;
    article: string;
    colorCode: string;
    rid: string;
    createdAt: string; // или Date, если вы преобразуете строку в объект Date
    offices: string[];
    skus: string[];
    id: number;
    warehouseId: number;
    nmId: number;
    chrtId: number;
    price: number;
    convertedPrice: number;
    currencyCode: number;
    convertedCurrencyCode: number;
    cargoType: number;
    isZeroOrder: boolean;
};

export type MyOrderType = {
    id: number;
    article: string;
};

export interface QrSticker {
    orderId: number;
    partA: number;
    partB: number;
    barcode: string;
    file: string;
}

export interface QrStickersResponse {
    stickers: QrSticker[]; // Массив объектов стикеров
}

export interface CombinedOrder {
    id: number;
    article: string;
    qr: string;
    partA: number;
    partB: number;
}

export type SortedSupply = {
    currentCompany: Companies;
    combinedOrders: CombinedOrder[];
    mainQrCode: string;
    ordersLength: number;
};

export type SupplyInfoResponse = {
    id: string;
    done: boolean;
    createdAt: string;
    closedAt: string;
    scanDt: string;
    name: string;
    cargoType: number;
    destinationOfficeId: number;
};
