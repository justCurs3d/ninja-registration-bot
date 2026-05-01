import { Message } from 'nestjs-telegraf';
import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
    CombinedOrder,
    SortedSupply,
    Companies,
    MyOrderType,
    OrderIdsResponse,
    QrSticker,
    QrStickersResponse,
    MainQrResponse,
    OrdersResponse,
    OrdersRequestParams,
    OrderInfo,
    SupplyInfoResponse,
} from 'src/common/types/types';
import { ConfigService } from 'src/config/config.service';
import { AllTokensInvalidError } from '../exceptions/wb.exceptions';
import { TokensService } from 'src/tokens/services/tokens.service';

@Injectable()
export class WbService {
    private axios: AxiosInstance;
    constructor(
        private configService: ConfigService,
        private tokensService: TokensService,
    ) {
        this.axios = axios.create({ baseURL: configService.wbApiUrl });
    }

    async getSortedSupply(supplyId: string): Promise<SortedSupply> {
        const { orders: allOrders, token, company } = await this.getOrdersWithArticles(supplyId);
        if (!allOrders) throw new AllTokensInvalidError();
        const orders = await this.deleteCancelledOrders(allOrders);
        const stickers = await this.getQrCodeStickersForOrders(orders, token);
        const combinedOrders = this.combineOrdersWithStickers(orders, stickers).sort(this.sortOrdersAlphabetically);
        const mainQrCode = await this.getMainQrCode(supplyId, token);
        return {
            currentCompany: company,
            combinedOrders,
            mainQrCode,
            ordersLength: orders.length,
        };
    }

    private async getMainQrCode(supplyId: string, token: string) {
        try {
            const mainQrCodeResponse = await this.axios.get<MainQrResponse>(`/v3/supplies/${supplyId}/barcode`, {
                headers: { Authorization: token },
                params: { type: 'png' },
            });

            return mainQrCodeResponse.data.file;
        } catch (error) {
            console.log('Не удалось запросить QR-код поставки');
            return '';
        }
    }

    private sortOrdersAlphabetically(order1: CombinedOrder, order2: CombinedOrder) {
        const article1 = String(order1.article);
        const article2 = String(order2.article);

        // Сравниваем строки
        if (article1 < article2) return -1;
        if (article1 > article2) return 1;
        return 0;
    }

    private combineOrdersWithStickers(orders: MyOrderType[], stickers: QrSticker[]): CombinedOrder[] {
        return orders.map((order) => {
            const sticker = stickers.find((sticker) => order.id === sticker.orderId);
            return {
                id: order.id,
                article: order.article,
                qr: sticker.file,
                partA: sticker.partA,
                partB: sticker.partB,
            };
        });
    }

    private async getAllOrdersPerWeek(
        token: string,
        params: OrdersRequestParams,
        ordersInfo: OrderInfo[] = [],
    ): Promise<OrderInfo[]> {
        const response = await this.axios.get<OrdersResponse>(`/v3/orders`, {
            headers: { Authorization: token },
            params,
        });

        const { orders, next } = response.data;

        ordersInfo.push(...orders);

        if (next && next !== 0) {
            return await this.getAllOrdersPerWeek(token, { ...params, next }, ordersInfo);
        }

        return ordersInfo;
    }

    private async getArticlesByOrderIds(orderIds: number[], token: string, supplyCreationTime: number) {
        try {
            const dateTo = supplyCreationTime + 7 * 24 * 60 * 60; //Неделя вперед
            const dateFrom = supplyCreationTime - 7 * 24 * 60 * 60; //Неделя назад
            const params: OrdersRequestParams = {
                limit: 1000,
                next: 0,
                dateTo,
                dateFrom,
            };

            const allOrdersPerWeek = await this.getAllOrdersPerWeek(token, params);

            return orderIds.map((orderId) => {
                const { article } = allOrdersPerWeek.find((order) => order.id === orderId);
                return {
                    id: orderId,
                    article,
                };
            });

            // return allOrdersPerWeek
            //     .filter((orderInfo) => orderIds.includes(orderInfo.id))
            //     .map((order) => {
            //         console.log(order);
            //         return {
            //             id: order.id,
            //             article: order.article,
            //         };
            //     });
        } catch (e) {
            throw new Error(e.message);
        }
    }

    private async getOrdersWithArticles(supplyId: string) {
        const companies = Object.values(Companies);
        for (const company of companies) {
            {
                try {
                    console.log(`Запрос поставки для ${company}`);
                    const token = await this.tokensService.getToken(company);
                    const ordersResponse = await this.axios.get<OrderIdsResponse>(
                        `/marketplace/v3/supplies/${supplyId}/order-ids`,
                        {
                            headers: { Authorization: token },
                        },
                    );
                    const { orderIds } = ordersResponse.data;
                    if (orderIds.length === 0) throw new Error('Для заданной компании поставка не найдена');

                    const supplyInfo = await this.getSupplyInfo(supplyId, token);
                    const supplyCreationTime = new Date(supplyInfo.createdAt).getTime() / 1000;

                    const ordersWithArticles = await this.getArticlesByOrderIds(orderIds, token, supplyCreationTime);
                    return {
                        orders: ordersWithArticles,
                        company: company,
                        token,
                    };
                } catch (error) {
                    console.log(error.message);
                    continue;
                }
            }
        }
    }

    private async deleteCancelledOrders(orders: MyOrderType[]): Promise<MyOrderType[]> {
        //TODO: проверять отмененные заказы
        return orders;
    }

    private async getQrCodeStickersForOrders(orders: MyOrderType[], token: string): Promise<QrSticker[]> {
        try {
            if (orders.length <= 99) {
                const payload = { orders: orders.map((order) => order.id) };
                const qrsResponse: AxiosResponse<QrStickersResponse> = await this.axios.post('/v3/orders/stickers', payload, {
                    headers: { Authorization: token },
                    params: {
                        type: 'png',
                        width: 58,
                        height: 40,
                    },
                });
                return qrsResponse.data.stickers;
            } else {
                const response: QrSticker[] = [];
                const chunkedOrders = this.chunkOrders(orders);

                await Promise.all(
                    chunkedOrders.map(async (ordersArray) => {
                        const payload = { orders: ordersArray.map((order) => order.id) };
                        const qrsResponse: AxiosResponse<QrStickersResponse> = await this.axios.post(
                            '/v3/orders/stickers',
                            payload,
                            {
                                headers: { Authorization: token },
                                params: {
                                    type: 'png',
                                    width: 58,
                                    height: 40,
                                },
                            },
                        );
                        response.push(...qrsResponse.data.stickers);
                    }),
                );

                return response;
            }
        } catch (e) {
            throw new Error('Ошибка на этапе запроса qr-кодов');
        }
    }

    private async getSupplyInfo(supplyId: string, token: string) {
        const response = await this.axios.get<SupplyInfoResponse>(`/v3/supplies/${supplyId}`, {
            headers: { Authorization: token },
        });

        return response.data;
    }

    private chunkOrders(orders: MyOrderType[], chunkSize = 99): MyOrderType[][] {
        const result: MyOrderType[][] = [];
        for (let i = 0; i < orders.length; i += chunkSize) {
            result.push(orders.slice(i, i + chunkSize));
        }
        return result;
    }
}

// Здесь можно добавить остальные три метода, использующие executeWithValidToken
