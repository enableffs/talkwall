# Tasks and issues Talkwall 3.0 (November 2016)

## PRI #0: Aligning video data with event logs in db

### Feed-interactions
* Add log entries for edit and mark events
````
"edit” or “mark”, message-id, (diff,) nickname, timestamp
````
### Teacher-interactions
* Add log entries for task panel operations
````
“edit” or “add”, task-id, (diff,) nickname, timestamp
````
### Wall-interactions
* Add log entries for wall events 
````
“promote” or “highlight”, message-id, nickname, timestamp
“move”, diff-x, diff-y, message-id, nickname, timestamp
````
### Identification of session
* Add page that show session id and timestamp. This page is meant to be filmed by the camera, crating both a synchronization point for the video and Talkwall log, and to enable a search in the Talkwall db, locating the corresponding event log.
````
Session id: XXXXXX 
Organiser: Real name (Group, Theme)
Talkwall time: hh:mm:ss dd:mm:yy
````
### Export of log data
* Add page that displays log data as csv. Input is a session id. Meant to be imported to NVivo. 

## PRI #1: Organisers can resume previous sessions
### Organise panel on Landing page
* Change ”JOIN” and ”CREATE” to ”JOIN” and ”ORGANISE”
* Selecting “JOIN”: same functionality as today
* Selecting ”ORGANISE” -> authentication (as now + PRI #6) -> new organise panel:

(see also proto.io)

Elements:

1. name: “Your Talkwall sessions”

1. top: person icon + text field: nickname of organiser (fetched from db if present)

1. list in two parts: 
   heading “recent”
   
   1. recent sessions (max 4) sorted by last opened date
   
   heading “all”
   
   1. all sessions (‘auto folder’) sorted alphabetically by group, then theme
		
1. two input fields: ’Group’ and ’Theme’

1. FAB button (+): Create new session (using values for Group and Theme if present)


* session item:
** 2 lines:
````
group/theme/status/date
X contributions, Y tasks: <start of task 1 wording>
````
* status: other organisers if any (PRI #2) + locked (icon) or pin code
* date: for recent list: relative date (e.g. 7d), else actual date (e.g. 11. Nov 2016)
* ‘auto folder’: if sessions with same value for Group > 4:
  ** display these sessions in collapsible list (see proto.io)

* session item menu:
**	status: locked/unlocked toggle
**	edit (change values for Group and Theme)
**	PRI #2: add organiser -> new add organiser panel
**	PRI #5: share as template -> new share panel
**	delete (mark as deleted in db)



### Right side panel
* Remove email field on closing panel. 
* Add toggle: lock/unlock -> set session as locked -> this disconnects all connected users
* Close just return to organize panel.

## PRI #2: Organisers can add organisers
### ‘Add organiser’ panel as part of organizer panel
````
”Add organiser(s):”
text field: Email(s) separated with commas
Add button
tip-text
````

* Server side: emails are processed and matched with organizers. This session is added to known organizers list of sessions. 
* Unknown organizers are kept in a separate list for later match when authenticating for the first time. 
* Result of this is displayed to user in a modal.

## PRI #3: Students right side panel
* Provide filtering and closing in the right side menu.
  ** Filter: same functionality as for organisers
* Closing -> clear pin and nick and go back to landing page.

## PRI #4: Teacher moves from plenary to group task
### Participants' walls
* Add button: ‘copy’: take a copy of wall contributions that are displayed (organiser or participant) (with x, y, marked) and store
* Add button: ‘paste to all’: take copy and paste to all participants

(the task screen may change between copy and paste from user navigation)

tip-text

## PRI #5: Share templates
### Sharing panel as part of organizer panel
````
	“Share as template”
	Text field: URL (auto generated)
  tip-text
````
* A copy of all tasks and organizer’s contributions and walls is made. Chips are anonymised.

* template URL ->
User is presented with authentication panel, 

then taken directly into Talkwall as organizer. 

## PRI #6: Feide login
* Add Feide to authentication panel. 

* Server side: UiO is already a service provider in the Feide system. Talkwall needs to be registered. 
