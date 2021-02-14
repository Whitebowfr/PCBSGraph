# PCBSGraph
 
So since PCBSTools stopped, I thought that the graph idea was pretty good, so I did one myself. 

How to use this :
- The first select box is for changing the order of sorting (ascending/descending)
- The second one is for switching between the CPU and GPU chart
- The third one is to choose from which factor the chart will be sorted
- The first input field is to search something in the chart (it includes everything so even score, frequency etc), it's not case-sensitive but you need to write exaclty the right thing
- The refresh button is to refresh the chart, useful when you disabled the auto-refresh obviously
- The second input field is to change the frequency of a CPU (you need to have only one CPU on the graph so use the search function), you enter a frequency and hit Store.
To reset the frequencies (you can store as much as you want), just reload the page (Ctrl + R)
- The third input field is to change the RAM speed : enter a number and it will simulate the CPUs running at this speed.
- The first checkbox is to enable/disable logarithmic scaling of the graph (switch between a linear and a logarithmic scale)
- The second checkbox is to disable the auto-updating of the chart (so when you change things it doesnt update the chart. The only things that will update the chart no matter what are the sort order, the CPU/GPU selector, the type of sorting and the logarithmic scaling.
- The last checkbox is to enable/disable HEM parts.
- The first select in the filter section is to select which property you want to filter
- The second select is to choose between equal, inferior or superior to the value you will enter (Sorry if it isn't very clear, go check it out yourself, it makes a lot more sense)
- The last input is to enter the value you want to filter by.
For example, if you select Score, < and enter 20000, it will show you every CPU that has a base score smaller than 20k.

And you can also click on the legend label to show different datasets. (for example, clicking on Frequency will show/hide the frequency bar)

To use the offline version, download the file here : https://raw.githubusercontent.com/Whitebowfr/PCBSGraph/gh-pages/PCBSGraph_offline.html

To do :
- [ ] make a better interface (change colors, inputs, etc) (please help I don't have any ideas)
- [ ] add storage, RAM, motherboards, cooling
- [x] ~~change where the data is stored (possibly to a server ?) so I can access it on each of my projects without having to store it in a gigantic var~~
- [ ] add a compare system (with checkboxes ?)
- [x] ~~add a second filter so we can combine and search more precisely~~
- [ ] change the search system to, instead of showing only the parts, scroll to them (kind of like in the part ranking app) (maybe with a toggle checkbox ?)
- [ ] Probably one of the biggest changes : clicking on a cpu/motherboard/ram show a page (kind of like in the old shop app) where you can see detailed information and compatible ram/cpu/sockets (still WIP)
- [ ] Add some kind of overclock calculator on the part details page