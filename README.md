# Google Map Front End Javascript Project

This is a front end project using google maps to visualise a list of locations.
To run the project, just open the homepage with your internet browser.
you may need a recent internet browser installed, preferrablly Chrome/Safari.

## Scope of work
* this project is a pure front end implementation

## Prerequisites
* Modern internet browser
* Active internet connection

## Getting Started
* Clone the repository to your local machine
* Open the homepage.html with your browser

## Data
* Data is stored in data.js

## How to navigate the page
### 1. Map View
The data stored in app.js will be shown on the map as markers.
Clicking on a marker will show an info window.

### 2. List View
There is a list of locations on the left hand side of the page.
The correspondent marker will pop when you put the mouse over a list item.
When the item is clicked an info window will show.

### 3. Search bar
There is a search bar above list view.
Typing in the search text box will show an dropdown list of suggested list item.
You can either click on the item to auto complete the input,
or leave the search box as it is.
The list view will be filtered to whatever you type in the search box.

### 4. Info Window
When a list item or marker is clicked, the info window regarding the item/marker will show.
It contains a google streetview div, and a wikepedia div.
the Google Streetview uses google map API
and the wikipedia information uses Ajax RESTFUL API calls.

### 5. Error Handling
a. connection - if Google map library could not be downloaded with in a couple of seconds, user will be alerted.
b. no google streetview - if there is no street view information regarding the location, an error message will be displayed in the div there streetview should be.
c. no wikipedia result - if there is an error loading wikipedia information regarding the location, an error message will be displayed. 

## Authors

* **Sean Fan** - *Initial work* - [SeanFan84](https://github.com/seanfan84)

## License

This project is not licensed.

## Acknowledgments
* Hat tip to anyone who's code was used
* Inspiration
* etc
