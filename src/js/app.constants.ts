/// <reference path='_references.ts'/>

module TalkwallApp {
    'use strict';

    export interface ITalkwallConstants {
        constants(): {};
    }

    export class TalkwallConstants {
        public static get constants() {
            return {
                POLL_INTERVAL_SECONDS: 5,
                POLLS_PER_LOG_ATTEMPT: 5,
                /****  Colours animated from wall.scss  References are here  */

                BACKGROUND_COLOURS: ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8', 'bg9'],
                // BACKGROUND_COLOURS: ["#5E7E98", "#666666", "#6D8565", "#7A7A7A", "#828565", "#858585", "#8EBEE6",
                //    "#998C5F", "#999999", "#ABD19F"],
                COMPLEMENTARY_COLOURS: ['#FFFFF5', '#FFFFF5', '#FFFFF5', '#FFFFF5', '#FFFFF5', '#FFFFF5', '#FFFFF5',
                    '#FFFFF5', '#FFFFF5', '#FFFFF5']

                //BACKGROUND_COLOURS: ["#CDCC43", "#D74FD3", "#D04538", "#6CCFCB", "#4F3862", "#4C3E23", "#C58178",
                // "#C74686", "#5D76C8", "#557D36"],
                //COMPLEMENTARY_COLOURS: ['#693289', '#DEFB5C', '#2A9D44', '#FFBB85', '#928F4F', '#1A2233', '#5A9369',
                // '#A7DE4E', '#FFCF65', '#7F374B']
            };
        };
    }
}
