import IBottomSheetService = angular.material.IBottomSheetService;
import ISidenavService = angular.material.ISidenavService;
import IWindowService = angular.IWindowService;
import IScope = angular.IScope;
import * as models from "../../models/models";
import {DataService} from "../../services/dataservice";
import {UtilityService} from "../../services/utilityservice";
import {URLService} from "../../services/urlservice";
import * as d3 from "d3"

let d: d3.Selection<HTMLElement, any, null, undefined> = d3.selection();

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
/*
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
    */


        /**
         * The `d3Selection` type represents a D3 selection object. Learn more about D3 selections
         * [here](https://github.com/d3/d3/blob/master/API.md#selections-d3-selection).
         *
         * @typedef {object} d3Selection
         */

        /**
         * The `d3Map` type represents a D3 map object. Learn more about D3 maps
         * [here](https://github.com/d3/d3-collection/blob/master/README.md#maps).
         *
         * @typedef {object} d3Map
         */

        /**
         * Generate one <svg> element per year, with each containing a <g>. The data associated with each <svg> is the year itself (an integer).
         *
         * @param {!number} width    - The width to use for the <svg>
         * @param {!number} height   - The height to use for the <svg>
         * @param {!number} cellSize - The cell size for each day <rect> within a year
         *
         * @return {d3Selection} A D3 selection of the generated <svg> elements
         */
        function generateYearGroups( width: number, height: number, cellSize: number ) {

            /**
             * Return the X-axis offset to use for the <g> element representing a given year.
             *
             * @return {!number} The X-axis offset
             */
            function getOffsetX(): number {
                return ( width - cellSize * 53 ) / 2;
            }

            /**
             * Return the X-axis offset to use for the <g> element representing a given year.
             *
             * @return {!number} The X-axis offset
             */
            function getOffsetY(): number {
                return ( height - cellSize * 7 - 1 );
            }

            return d3.select( ".calendarDisplay" )
                .selectAll( "svg" )
                .data( d3.range( 1990, 2011 ) )
                .enter()
                .append( "svg" )
                .attr( "width", width )
                .attr( "height", height )
                .attr( "class", "year" )
                .append( "g" )
                .attr( "transform", "translate(" + getOffsetX() + "," + getOffsetY() + ")" );
        }

        /**
         * Attach a <text> element to each <g> using the year as the text.
         *
         * @param {!d3Selection} yearGroups - A D3 selection object representing the <g> elements for all years
         * @param {!number}      cellSize   - The size of each day cell, in pixels
         */
        function attachTextToYearGroups( yearGroups: any, cellSize: number ) {

            yearGroups.append( "text" )
                .attr( "transform", "translate(-6," + cellSize * 3.5 + ")rotate(-90)" )
                .style( "text-anchor", "middle" )
                .text( function( year: any ) { return year; } );
        }

        /**
         * Perform the following actions:
         *
         *     1. Generate one <rect class="day"> for each day of each year
         *     2. Attach each generated <rect> to the <g class="year"> for the associated year
         *     3. Attach the date object for the given day as the data for the <rect>
         *     4. Convert the date objects associated with each <rect> to a date string
         *
         * @param {!d3Selection} yearGroups - A D3 selection object representing the <g> elements for all years
         * @param {!number}      cellSize   - The size of each day cell, in pixels
         *
         * @return {d3Selection} A D3 selection representing the generated rectangles
         */
        function generateDayRects( yearGroups: any, cellSize: number ) {

            /**
             * Return the week number for the given date, where 0 represents the first week of the year
             * and 51 represents the last.
             *
             * @param {!Date} date - The date
             *
             * @return {number} The day number
             */
            function getWeekNumber( date: Date ) {
                return d3.timeWeek.count( d3.timeYear( date ), date );
            }

            /**
             * Return the day number for the given date, where 0 represents Sunday and
             * 6 represents Saturday.
             *
             * @param {!Date} date - The date
             *
             * @return {number} The day number
             */
            function getDayNumber( date: Date ) {
                return date.getDay();
            }

            /**
             * Return the X-axis coordinate to use for the top-left corner of the rectangle
             * representing the given date.
             *
             * @param {!Date} date - The date
             *
             * @return {number} The X-axis coordinate
             */
            function getX( date: Date ) {
                return getWeekNumber( date ) * cellSize;
            }

            /**
             * Return the Y-axis coordinate to use for the top-left corner of the rectangle
             * representing the given date.
             *
             * @param {!Date} date - The date
             *
             * @return {number} The Y-axis coordinate
             */
            function getY( date: Date ) {
                return getDayNumber( date ) * cellSize;
            }

            /**
             * Generate and return an array of date objects representing all of the days
             * in the given year.
             *
             * @param {!number} year - The year
             *
             * @return {Array.<Date>} The array of date objects
             */
            function getAllDaysInYear( year: number ) {
                return d3.timeDays( new Date( year, 0, 1 ), new Date( year + 1, 0, 1 ) );
            }

            return yearGroups.selectAll( ".day" )
                .data( getAllDaysInYear )
                .enter()
                .append( "rect" )
                .attr( "class", "day" )
                .attr( "width", cellSize )
                .attr( "height", cellSize )
                .attr( "x", getX )
                .attr( "y", getY )
                .datum( d3.timeFormat( "%Y-%m-%d" ) ); //  we format the dates to match the format in the CSV file (yyyy-mm-dd)
        }

        /**
         * Attach a <title> element to each of the given day rectangles, using the same data string that was generated for the rectangle.
         *
         * @param {!d3Selection} dayRects - A D3 selection object
         */
        function attachTitlesToDayRects( dayRects: any ) {

            dayRects.append( "title" )
                .text( function( s: any ) { return s; } );
        }

        /**
         * Perform the following actions:
         *
         *     1. Generate one <path class="month"> for each month of each year
         *     2. Attach each generated <path> to the <g class="year"> for the associated year
         *     3. Attach the date object for the given month as the data for the <p>
         *     4. Attach the path description for the given month as the @d attribute of the <p>
         *
         * @param {!d3Selection} yearGroups - A D3 selection object representing the <g> elements for all years
         * @param {!number} cellSize   - The size of each day cell, in pixels
         */
        function appendMonthPathsToYearGroups( yearGroups: any, cellSize: number ) {

            /**
             * Generate and return an array of date objects representing all of the months
             * in the given year.
             *
             * @param {!number} year - The year
             *
             * @return {Array.<Date>} The array of date objects
             */
            function getAllMonthsInYear( year: number ) {
                return d3.timeMonths( new Date( year, 0, 1 ), new Date( year + 1, 0, 1 ) );
            }

            /**
             * Generate and return the <path> description for the given month, where the path
             * is the outline drawn around each month in the following representation of a year:
             *
             *      JAN   FEB  MAR  APR   MAY  JUN  JUL   AUG  SEP   OCT  NOV  DEC
             *       |     |    |    |     |    |    |     |    |     |    |    |
             *
             *      -----------------------------------------------------------------
             *      |1111|2222|3333|44444|5555|6666|77777|8888|99999|0000|AAAA|BBBBB|  --- Sundays
             *     |11111|2222|3333|44444|5555|6666|77777|8888|9999|00000|AAAA|BBBBB|  --- Mondays
             *     |11111|2222|3333|4444|55555|6666|77777|8888|9999|00000|AAAA|BBBB|   --- Tuesdays
             *     |11111|2222|3333|4444|55555|6666|7777|88888|9999|00000|AAAA|BBBB|   --- Wednesdays
             *     |1111|2222|33333|4444|55555|6666|7777|88888|9999|0000|AAAAA|BBBB|   --- Thursdays
             *     |1111|2222|33333|4444|5555|66666|7777|88888|9999|0000|AAAAA|BBBB|   --- Fridays
             *     |1111|2222|33333|4444|5555|66666|7777|8888|99999|0000|AAAA|BBBBB|   --- Saturdays
             *     -----------------------------------------------------------------
             *
             * Breaking out the outline, the general format looks like this:
             *
             *      7----6
             *      |nnnn|
             *      |nnnn|
             *      |nnnn|
             *     10nnnn|
             *     |nnnnn|
             *     |nnnn45
             *     |nnnn|
             *     2----3
             *
             *  where 0-7 indicate the vertices of the shape, in the order in which the outline
             *  will be drawn.
             *
             * @param {!Date} month - The date object representing the month
             *
             * @return {string} The path description
             */
            function getPathDescriptionForMonth( month: Date ) {

                let nextMonth: Date,                //  date object for the first of the month after the given one
                    nextMonthDayOfWeek: number,       //  0 (sunday) - 6 (saturday)
                    nextMonthWeekOfYear: number,      //  0 (first week) - 51 (last week)
                    path: string,
                    thisMonthDayOfWeek: number,       //  0 (sunday) - 6 (saturday)
                    thisMonthWeekOfYear: number;      //  0 (first week) - 51 (last week)

                nextMonth = new Date( month.getFullYear(), month.getMonth() + 1, 0 );
                thisMonthDayOfWeek = month.getDay();
                thisMonthWeekOfYear = d3.timeWeek.count( d3.timeYear( month ), month );
                nextMonthDayOfWeek = nextMonth.getDay();
                nextMonthWeekOfYear = d3.timeWeek.count( d3.timeYear( nextMonth ), nextMonth );

                //  generate a path of the form:
                //  
                //      M{0.x},{0.y}H{1.y}V{2.y}H{3.x}V{4.y}H{5.x}V{6.y}H{7.x}
                //
                //  where:
                //  
                //      {n.x} represents the x coordinate of point `n` in the per-month chart, above
                //      {n.y} represents the y coordinate of point `n` in the per-month chart, above 
                //
                path = "M" + ( thisMonthWeekOfYear + 1 ) * cellSize + "," + thisMonthDayOfWeek * cellSize  //  moveto #0
                    + "H" + thisMonthWeekOfYear * cellSize                                                //  lineto #1
                    + "V" + 7 * cellSize                                                                  //  lineto #2
                    + "H" + nextMonthWeekOfYear * cellSize                                                //  lineto #3
                    + "V" + ( nextMonthDayOfWeek + 1 ) * cellSize                                         //  lineto #4
                    + "H" + ( nextMonthWeekOfYear + 1 ) * cellSize                                        //  lineto #5
                    + "V" + 0                                                                             //  lineto #6
                    + "H" + ( thisMonthWeekOfYear + 1 ) * cellSize                                        //  lineto #7
                    + "Z";                                                                                //  close path

                return path;
            }

            yearGroups.selectAll( ".month" )
                .data( getAllMonthsInYear )
                .enter()
                .append( "path" )
                .attr( "class", "month" )
                .attr( "d", getPathDescriptionForMonth );
        }

        /**
         * Update the class attribute and <title> element for each day <rect> that
         * appears in the given data set.
         *
         * @param {!d3Selection} dayRects - A d3 selection
         * @param {!d3Map}       data     - A D3 nested map
         */
        function updateClassAndTitleForDayRects( dayRects: any, data: any ) {

            let color: any,
                percentFormatter: any;

            /**
             * Generate a return a D3 scale function for mapping values from -0.05 to +0.05
             * to one of eleven colors. See [here](https://github.com/d3/d3-scale/blob/master/README.md#scaleQuantize)
             * for more information about quantize scales.
             *
             * @return {function} The scale function
             */
            function getColorScale() {
                return d3.scaleQuantize<string>()
                    .domain( [ -0.05, 0.05 ] )
                    .range( d3.range( 11 ).map( function( int ) { return "color" + int; } ) );
            }

            /**
             * Return a boolean indication of whether the given date string exists
             * in the data set.
             *
             * @param {!string} dateString - The date string
             *
             * @return {boolean} True if the given data exists in the data set; false otherwise
             */
            function isRectDataInCsvData( dateString: string ) {
                return data.has( dateString );
            }

            /**
             * Generate and return the value of the class attribute to use for a <rect> having the given date string
             * as its data.
             *
             * @param {!string} dateString - The date string
             *
             * @return {string} The class attribute value
             */
            function getRectClass( dateString: string ) {
                return "day " + color( data.get( dateString ) );
            }

            /**
             * Generate and return the title to use for a <rect> having the given date string
             * as its data.
             *
             * @param {!string} dateString - The date string
             *
             * @return {string} The title
             */
            function getRectTitle( dateString: string ) {
                return dateString + ": " + percentFormatter( data.get( dateString ) );
            }

            color = getColorScale();
            percentFormatter = d3.format( ".1%" );

            dayRects.filter( isRectDataInCsvData )
                .attr( "class", getRectClass )
                .select( "title" )
                .text( getRectTitle )
                .on('click', function( d: any, i: any){
                    console.log('data: '+ d + ' i: ' + i);
                });
        };

        /**
         * Transform the given CSV data, structured as an array of objects, into a D3 nested map.
         * See [here](https://github.com/d3/d3-collection/blob/master/README.md#nest_map) for information
         * about nested maps.
         *
         * @param {!Array.<object>} csv - An array of objects representing the data parsed from the CSV file
         *
         * @return {d3Map} A D3 nested map
         */
        function transformCsvData( csv: any ) {

            /**
             * Calculate and return the key to associate with the given data objects,
             * where each object represents one day's information about the Dow Jones Industrial average.
             *
             * @param {!object} dataObject - The data object
             *
             * @return {number} The key
             */
            function getDataObjectKey( dataObject: any ) {
                let a = dataObject.Date;
                return a;
            }

            /**
             * Calculate and return the value to associate with the given array of data objects.
             * Specifically, we calculate the % change of the Dow Jones Industrial average for
             * the date represented by the first object in the array.
             *
             * @param {!Array.<object>} dataObjects - The data objects
             *
             * @return {number} The calculated value
             */
            function getDataObjectValue( dataObjects: any ) {
                let a = ( dataObjects[ 0 ].Close - dataObjects[ 0 ].Open ) / dataObjects[ 0 ].Open;
                return a;
            }

            return d3.nest<number, number>()
                .key( getDataObjectKey )
                .rollup( getDataObjectValue )
                .map( csv );
        }

        /**
         * Render a calendar using the data in the given D3 nested map.
         * See [here](https://github.com/d3/d3-collection/blob/master/README.md#nest_map)
         * for information about nested maps.
         *
         * @param {!d3Map} data - A D3 nested map
         */
        function render( data: any ) {

            let cellSize: number,
                dayRects: any,
                height: number,
                width: number,
                yearGroups: any;

            cellSize = 17;
            height = 136;
            width = 960;

            yearGroups = generateYearGroups( width, height, cellSize );
            attachTextToYearGroups( yearGroups, cellSize );
            dayRects = generateDayRects( yearGroups, cellSize );
            attachTitlesToDayRects( dayRects );
            appendMonthPathsToYearGroups( yearGroups, cellSize );
            updateClassAndTitleForDayRects( dayRects, data );
        }

        //  (1) load the data in the CSV file
        //  (2) transform it into the format we need
        //  (3) render the transformed data
        d3.csv( "dji.csv", function( err: any, csv: any ) {

            let data: any;

            if ( err ) {
                throw err;
            }

            data = transformCsvData( csv );
            render( data );
        } );






    }

}