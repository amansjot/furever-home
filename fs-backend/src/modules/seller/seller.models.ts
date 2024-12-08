export interface SellerModel {
    _id: string;
    user: string;
    orgName: string;
    sellerType: string;
    sellerLocation: string;
    sellerContact: string;
    pets: Object[];
    sellerPhoto: string;
    requests: Object[];
}
