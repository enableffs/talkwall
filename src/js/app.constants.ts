/*
 Copyright 2016, 2017 Richard Nesnass and Jeremy Toussaint

 This file is part of Talkwall.

 Talkwall is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 Talkwall is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with Talkwall.  If not, see <http://www.gnu.org/licenses/>.
 */

export class TalkwallConstants {
    static get Constants(): any {
        return {
            POLL_INTERVAL_SECONDS: 5,
            POLLS_PER_LOG_ATTEMPT: 5,
            /****  Colours animated from wall.scss  References are here  */
            BACKGROUND_COLOURS: ['bg1', 'bg2', 'bg3', 'bg4', 'bg5', 'bg6', 'bg7', 'bg8', 'bg9'],
            COMPLEMENTARY_COLOURS: ['#FFFFF5', '#FFFFF5', '#FFFFF5', '#FFFFF5', '#FFFFF5', '#FFFFF5', '#FFFFF5',
                '#FFFFF5', '#FFFFF5', '#FFFFF5'],
            MAX_NICKNAME_CHARS: 15

            // BACKGROUND_COLOURS: ["#5E7E98", "#666666", "#6D8565", "#7A7A7A", "#828565", "#858585", "#8EBEE6",
            //    "#998C5F", "#999999", "#ABD19F"],
            //BACKGROUND_COLOURS: ["#CDCC43", "#D74FD3", "#D04538", "#6CCFCB", "#4F3862", "#4C3E23", "#C58178",
            // "#C74686", "#5D76C8", "#557D36"],
            //COMPLEMENTARY_COLOURS: ['#693289', '#DEFB5C', '#2A9D44', '#FFBB85', '#928F4F', '#1A2233', '#5A9369',
            // '#A7DE4E', '#FFCF65', '#7F374B']
        }
    }
}