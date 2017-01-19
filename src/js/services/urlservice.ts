import ILocationService = angular.ILocationService;

export class URLService {
    static $inject = ['$location'];

    constructor( private $location: ILocationService ) {
        console.log('--> URLService started ... ');
    }

    getHost(): string {
        if (this.$location.port() === 80) {
            return this.$location.protocol() + '://' + this.$location.host();
        } else {
            return this.$location.protocol() + '://' + this.$location.host() + ':' + this.$location.port();
        }
    }
}