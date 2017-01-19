import IBottomSheetService = angular.material.IBottomSheetService;
import ISidenavService = angular.material.ISidenavService;
import IWindowService = angular.IWindowService;
import IScope = angular.IScope;
import * as models from "../../models/models";
import {DataService} from "../../services/dataservice";
import {UtilityService} from "../../services/utilityservice";
import {URLService} from "../../services/urlservice";
import * as d3 from "d3"

//let d: d3.Selection<HTMLElement, any, null, undefined> = d3.selection();

export class LogController {
    static $inject = ['DataService', '$mdSidenav', '$mdBottomSheet', '$translate', '$scope', '$timeout', 'URLService', '$window', 'UtilityService'];

    private wall_id: string;
    private wall: models.Wall = null;
    private errorString: string;
    private languageCode: string = 'no';

    constructor(
        private dataService: DataService,
        private $mdSidenav: ISidenavService,
        private $mdBottomSheet: IBottomSheetService,
        private $translate: angular.translate.ITranslateService,
        private $scope: IScope,
        private $timeout: angular.ITimeoutService,
        private urlService: URLService,
        private $window: IWindowService,
        private utilityService: UtilityService) {
        console.log('--> LogController: started: ');

        let langKey: string = 'lang';
        this.languageCode = this.$window.sessionStorage[langKey];
    }

    requestWall(): void {
        this.dataService.requestWall(this.wall_id, () => {
            this.errorString = '';
            this.wall = this.dataService.data.wall;
            this.drawCalendar();
        }, (error: {status: number, message: string}) => {
            if (error.status === 401) {
                this.errorString = 'Unauthorised. Please log in first.'
            } else {
                this.errorString = error.message;
            }
            console.log('Error getting wall');
        })
    }

    requestLogs(): void {

    }


    drawCalendar(): void {

        let width = 960,
            height = 136,
            cellSize = 17; // cell size

        let percent = d3.format(".1%"),
            format = d3.timeFormat("%Y-%m-%d");

        let color = d3.scaleQuantize<string>()
            .domain([-.05, .05])
            .range(d3.range(11).map(function(d) { return "q" + d + "-11"; }));

        let svg = d3.select(".calendarDisplay").selectAll("svg")
            .data(d3.range(1990, 2011))
            .enter().append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", "RdYlGn")
            .append("g")
            .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

        svg.append("text")
            .attr("transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)")
            .style("text-anchor", "middle")
            .text(function(d) { return d; });

        let rect = svg.selectAll(".day")
            .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter().append("rect")
            .attr("class", "day")
            .attr("width", cellSize)
            .attr("height", cellSize)
            .attr("x", function(d) { return d3.timeWeek.count(d, d) * cellSize; })
            .attr("y", function(d) { return d.getDay() * cellSize; })
            .datum(format);

        rect.append("title")
            .text(function(d) { return d; });

        svg.selectAll(".month")
            .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
            .enter().append("path")
            .attr("class", "month")
            .attr("d", monthPath);

        d3.csv("dji.csv", function(error: any, csv: any) {
            if (error) throw error;

            let data = d3.nest<number, number>()
                .key(function(d) { return d['Date']; })
                .rollup(function(d) { return (d[0]['Close'] - d[0]['Open']) / d[0]['Open']; })
                .map(csv);

            rect.filter(function(d) { return d in data; })
                .attr("class", function(d) { return "day " + color(data[d]); })
                .select("title")
                .text(function(d) { return d + ": " + percent(data[d]); });
        });

        function monthPath(t0: any) {
            let t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
                d0 = t0.getDay(), w0 = d3.timeWeek.count(t0, t0),
                d1 = t1.getDay(), w1 = d3.timeWeek.count(t1, t1);
            return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
                + "H" + w0 * cellSize + "V" + 7 * cellSize
                + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
                + "H" + (w1 + 1) * cellSize + "V" + 0
                + "H" + (w0 + 1) * cellSize + "Z";
        }

    }

}