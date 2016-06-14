# Talkwall Tasks & Specs


## Credentials for Talkwall

Management: https://google.com

* GOOGLE cloud user: samtavla@uio.im
* GOOGLE password: Samtavla12345

Management: https://console.developers.google.com

* GOOGLE_APP_ID=312282874016-e02bqn75eqr6f966ir4rtdug9i7onfu6.apps.googleusercontent.com
* GOOGLE_APP_SECRET=JIvKEBDFsIx7LE7osRHBodtf
* GOOGLE_CALLBACK=http://localhost:8080/auth/google/callback

Management: https://developers.facebook.com

* FACEBOOK account: samtavla@uio.im
* FACEBOOK password: Samtavla12345
* FACEBOOK_APP_ID=1790284507858283
* FACEBOOK_APP_SECRET=16213a4ac5dc75f234e2046b888deb16
* FACEBOOK_CALLBACK=http://local.talkwall.no:8080/auth/facebook/callback





## Front End

### 1. Landing page
'Join with PIN' - Login
- leads to (2)
'Create' - Login
- leads to (3)
- keep current front page

### 2. PIN entry panel
modal appears above (1)
enter PIN and name
- leads to (3)

###  3. Login service
modal appears with choices for Google, Facebook and (faded out) FEIDE
teacher 'create'- leads to (4)

### 4. List of Talkwalls
allow selection of an existing wall from list, or create new, or delete
- leads to (5)
- implement list view
* List consists of <talkwalk_title> <author> [<dato> <num questions> <num message>]


- implement control widget toggle

### 5. Main Talkwall screen
(from 4 create new) -> show an empty wall, no questions. Show the 'Edit tasks' submenu
Generate a pin for this wall.

(from 4 continue existing) -> show the existing wall, first question (?)

### Top bar
--------------------------
?

### Menu 3 - right hand side
--------------------------
* slack like
* Open and close 'hamburger'
* Vertical panels for each category - expandable

##### Edit Tasks (questions) Submenu
add a new question, list current questions

##### PIN display (questions) Submenu
Display PIN. see prototype for example

##### Close Submenu
Confirmation that PIN will be removed.
- leads to (4)

##### Rules Submenu
Two panes.
	The first is basic editable free text and reflected on students' machines (not editable)
	The second is a reflection of each question for reference. One per line.
	'How to use Talkwall' links to Webpage
	
##### Edit Tasks (questions) Submenu
add a new question, list current questions


##### Message Filters Submenu
Categoriese By Hashtags and By Message Creator
Icons
	Number of messages submitted for the question
	Checkbox to filter messages from certain participants
	

### PIN generation
Destroy PIN when teacher closes browser or logs out. Teacher must be active for the wall to be receiving messages.
PIN is generated active when the teacher chooses a wall.
PIN is cancelled when Teacher chooses to 'close' the wall deliberately.
Manage PIN validity with Redis


### Menu 1 - left hand side
--------------------------

!!! Sidemenu must not cover question and walls navigation

Show screens

By default, only the teacher
If the teacher moves a message of a given 'screen', this also affects the students screen


Message feed

(+) button must aligned center on the small feed



### Menu 2 - right hand side
--------------------------
User Screen filter

Shows each student / group icon, name and allows Teacher to select (radio button) and view one of their screens.
Also show icon to reflect which question they are currently seeing.
Also allows 'select all' , (select none?)

Message filter

By default all participants selected, and all tags selected, (+ 'no tag' category)
Showing/hidding and/or tags participants only affects own screen (whether teacher or students) -> no persistance, no broadcast



### Messages
------------
(low priority) Define three max text length sizes
'pop open' when tapped?
show text countdown

#### Message editor
--
Should be of type "bottom sheet" (takes the full width of the screen as modal)
Dissmisses using click on the backdrop or swipe or message post


#### Message feed
--
Hamburger menu opens 3 options: "add to wall", "edit", "delete"

* "add to wall": the message remains 'orange' as long as it is on the wall (the message on wall remains white when added)
* "edit": opens the bottom sheet and places the text within
* "delete": removes the message from the wall and the feed and mark it as "deleted" (remains persisted in the DB)

#### Message 'label'
--
when clicking on the 'A' of a message, this turns the message into a label with a specific style. The functionality remains the same (copying, editing, deleting, etc)


### Move beetween walls
------------------

* navigation arrows should hide if only 1 question
* navigation arrwos show/hide depending on number of questions (i.e, on last question, right arrow is hidden)
* to select a message: 
	* click hamburger ("check", "edit", "remove from wall", "make label")
	* choose "check"
	* message turns orange
	* show confirm dialog
	* transition/animation/spinning wheel
	* pinned message is added to feed and placed on wall
	* pinned messages on new screen turn white (old messages on previous screen remain orange)
	* un-pinned message get a screen number where they come from (same thing on the feed)


### Close talkwall
------------------

* teacher clicks on the "close" button under right-hand panel
* pin gets expired
* upon next polling, clients display a dialog for closure
* text rendering in HTML in a scrollable and selectable pane on a modal (for each nickname and for each question of a wall):
	* question
	* wall export (text), with sorted list in this order:
		* top-left corner
		* bottom-left corner
		* top-right corner
		* bottom-right corner
	* feed list of all message (as they appear in the feed)



### Mobile version
------------------

* Move between walls
* Show the question at top
* Show a list of the feed
* Posts go to the Teacher wall
* (hamburger submenu options are low priority)



## Server

route definitions
route code


## Database

design the stucture
create models


## Other

create 'talkwall v2' 
samtavla-ts is on Heroku now
rename it to Talkwall





# Roadmap

## Version 2.0 minimal

* Project setup, platform and distribution
	* landing page (needs edits OLE)
	* CREATE -> login panel (google / facebook)
		* ~~auhtentication~~
		* ~~open last or create new (dialog as today)~~
			* ~~if new, slide open "new task" right panel~~
			* ~~if not, everything closed, with teacher's messages on board~~
	* JOIN
		* ~~join pin dialog with nickname (only one nickname allowed)~~
	* wall
		* ~~layout~~
		* sidepanel-left
			* "Messages" tab
				* zoom
					* ~~larger side panel~~
					* apply larger fonts
				* message feed
					* ~~white footer to allow graphical position of the (+) button (so that it doesn't cover a message)~~
					* ~~latest message at the bottom (no auto scroll, keep position)~~
					* message
						* ~~show text (3 lines that fits 140 characters)~~
						* history (chips). chips have a fixed size, with "...". fit as many chips has possible on one line (+ '...' if it goes beyond)
						* controllbar
							* ~~select (place on wall) / deselect (removes from wall)~~
								* ~~keep random placement around the center~~
							* ~~edit (should open the text in the edit pane)~~
								* if not owner of the message, create a copy, inherit history and metadata, and appends to the message feed. keep originator message ID.
							* ~~delete (remove from list not from DB)~~
						* ~~selected message inherits 'light' orange background~~
			* ~~Add message button (+)~~
				* ~~position bottom left~~
				* ~~shows a bottom-sheet component~~
				* ~~slide open message feed if closed~~
			* "Show screens" tab
				* client list
					* client
						* standard icon (same but for the teacher -> crown)
						* nickname
						* select checkbox (selected -> display client's task wall same as teacher's task number)
					* select all button checks all checkboxes (-> unselect all button, but keep the teacher)
		* ~~Add message bottom-sheet~~
			* ~~textarea fixed length 140 char~~
			* ~~check button~~
				* ~~adds a message to the feed and dismisses the bottom-sheet~~
		* sidepanel-right ("slack style", one panel open at a time)
			* ORGANIZER -> "Join with PIN" panel
				* as today (dynamic update of participants count based on polling)
			* ORGANIZER -> "Edit tasks" panel
				* ~~List of exisiting tasks (by default empty list)~~
					* ~~task has slide control to edit, delete~~
					* ~~delete only works if no messages for that task~~
				* "Add task" panel (10 tasks max -> matching color palette for task background)
					* ~~Text input, background, submit (no message size selector)~~
					* ~~submit button adds/validates a task in the list above~~
			* ORGANIZER -> "Close Talkwall" panel
				* ~~text that explaind the effects of closing~~
				* Clients receive an instruction to disconnect based on polling
					* dialog thanking for participation
					* ok, takes back to landing page
				* Send email to organiser with link to URL (report page rich text or HTML)
					* page [https://github.com/engagelab/talkwall/blob/master/export%20spec.md]
		* message "on-wall"
			* control
				* ~~select: highights message by setting a 'light orange' background~~
				* edit: brings up message bottom-sheet with its content to edit
					* ~~(should open the text in the edit pane)~~
					* if not owner of the message (revision 01/06):
						 * create a copy (clone and get a new message id)
						 * inherit history and metadata
						 * inherit position x. y
						 * appends to the message feed.
						 * place the new maessage on board on previous position
						 * remove origin message from board
				* ~~remove: remove from wall (-> unhighlights in the feed)~~
			* ~~messages has fixed width, variable height to show all content~~
				* ~~all content should be visible so messages can be auto relocated~~
		* top bar
			* ~~"message feed" button~~
			* ~~"screens" button (teacher only)~~
			* next task button (if next task exists)
				* ~~teacher -> next wall also triggers all participant's apps~~
				* ~~student -> only affects his/her wall~~
			* ~~previous task button (if previous task exists)~~
				* ~~teacher -> previous wall also triggers all participant's apps~~
				* ~~student -> only affects his/her wall~~
			NOTE when moving from one task to the next: 
				* when interaction occurs (drag, write, scroll, etc -> no polling)
				* background animation between questions
			* ~~"hamburger" button (teacher only)~~
	* PHONE version
		* ~~JOIN only~~
		* ~~add messages to feed~~
		* ~~navigate between tasks~~
		* edit, delete own messages
			* edit not own creates new copy with history (same as desktop)
		* ~~wall hidden~~
		* ~~right-hand menu hidden~~
* Test
* Bug fixing


## Version 2.0 addition: filtering/hashtags

* platform
	* wall
		* sidepanel-right
			* "Filter messages" panel
				* top:
					* list Nicknames with checkbox (lower pri)
				* bottom:
					* list submitted hashtags with checkbox (high pri)
				* Apply filters to messages on wall and on feed - indicate active filter in panel name
				* Release filter when whole sidepanel is closed by hamburger
				

## Version 2.0 lower priority

* platform
	* wall
		* sidepanel-left
			* "Messages" tab
				* message feed
					* message
						* (+) button can be turned transparent and list all the way to the bottom
						* history chips needs to be restyled
						* controllbar
							* icons may need updating
					
* Test
* Bug fixing

## Version 3.0

* Platform
	* wall
		* sidepanel-right
			* "Rules" panel
				* top: 
					* ORGANIZER -> "Edit rules"
						* Edit rules in place
			* ORGANIZER -> "Edit tasks" panel
				* "Add task" panel
					* Select max lenght of messages (three options: concept, tweet, summary) 
			* "Close Talkwall" panel
				* Display contents of Talkwall for this client as (report page rich text or HTML)
				
		* message "on-board"
			* when selected: copy to next wall when requested
			* control:
				* make heading: change styling of message 	
			
* Test
* Bug fixing


## Version 4.0

* Platform
	* login panel (feide)
		* auhtentication
		* list existing walls
			* delete walls
			* edit wall name
			* share wall as template
				* copy tasks, labels and rules
				* create URL for template
				* show URL in a window
		* continue wall
		* start new wall

* Test
* Bug fixing

