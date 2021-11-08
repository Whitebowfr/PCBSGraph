function readTextFile(file, callback) { //stole this from stackoverflow, works like a charm
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
        if (rawFile.readyState === 4 && rawFile.status == "200") {
            callback(rawFile.responseText);
        }
    }
    rawFile.send(null);
}
var myData

//Open the data file, and also fire the whole code (since it's asynchronous, we must wait for it to load)
readTextFile("https://raw.githubusercontent.com/Whitebowfr/PCBSGraph/gh-pages/helpers/data.json", function(text) {
    myData = JSON.parse(text);
    updateGraph('')
});

//Check if image exist in the database, used in the part shower
//Returns a boolean
function imageExists(image_url) {
    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    return http.status != 404;
}

//Count the number of empty elements in an array
//Returns a number
function getNonEmptyEl(obj) {
    var count = 0
    for (el in obj) {
        if (obj[el] != "") {
            count++
        }
    }
    return count
}

//Check if a certain value is already in an array (doesnt seem to work very well), used in the legendBase
//Returns a boolean
function getIfElIn(obj, txt) {
    for (el in obj) {
        if (obj[el] == txt) {
            return true
        }
    }
    return false
}

//simple function that reduce line size by a lot (and is also never used because we can use jquery for this)
function id(id) {
    return document.getElementById(id)
}

//Used to quit the part shower, doesnt delete the chart, so it's lag-friendly
function goBack(e) {
    if (e == 'yes' || e.key == "Escape") {
        document.getElementById("divPartShower").style.display = "none"
        document.getElementById("backButton").style.display = "none"
        document.getElementById("divCPUGraph").style.display = "block"
    }
    window.scrollTo({ top: myChart.boxes[3]._labelItems[sessionStorage.getItem("currentlyScrolledTo") - 1].y })
    window.removeEventListener("keyup", function(e) { goBack(e) })
}

//extract the differents parts from a certain type in the specified array
//should return an Object containing each parts from the type specified
function GRAPHextractArray(array, type) {
    for (part in myData[type]) {
        if (myData[type][part].inShop == "Yes" || myData[type][part].isInShop == "Yes" && myData[type][part].singleGPUGraphicsScore != 0 || type == "coolers") {
            if (!id("enableHEM").checked && myData[type][part].isHEMPart) {
                continue
            } else {
                array.push(myData[type][part])
            }
        }
    }
    return array
}

//Filter an array from a factor, and two limits
//Returns an array
function getFilteredArrayGreater(array, factor, lowerLimit, upperLimit) {
    var finishedResult = []
    for (part in array) {
        console.log(isNaN(array[part][factor]))
        if (isNaN(array[part][factor])) continue
        if (Number(array[part][factor]) > lowerLimit && Number(array[part][factor]) < upperLimit) finishedResult.push(array[part])
    }
    return finishedResult
}

//Sort an array
//Returns the same array, with a different order
function sortArray(array, factor, sort) {
    // true = down, false = up
    if (factor != 0) {
        if (sort == "true") {
            return array.sort((a, b) => (a[factor] < b[factor]) ? 1 : -1);
        } else {
            return array.sort((a, b) => (a[factor] > b[factor]) ? 1 : -1);
        }
    } else {
        let firstFactor = document.getElementById("ratioTypeFilter").value
        let secondFactor = document.getElementById("ratioTypeFilterBis").value
        if (sort == "true") {
            return array.sort((a, b) => ((a[firstFactor] / a[secondFactor]) < (b[firstFactor] / b[secondFactor])) ? 1 : -1);
        } else {
            return array.sort((a, b) => ((a[firstFactor] / a[secondFactor]) > (b[firstFactor] / b[secondFactor])) ? 1 : -1);
        }
    }
}

//Returns an array containing ONLY the parts with the specified key
function filterArray(array, key) {
    var temp = []
    for (el in array) {
        if (key != "" && JSON.stringify(array[el]).toLowerCase().includes(key.toLowerCase())) {
            temp.push(array[el])
        }
    }
    return temp
}

//Returns a number, used with the custom Frequency calc
function GRAPHgetCPUScore(cpu, multiplier, memorySpeed) {
    if (memorySpeed == "" || memorySpeed == null) {
        memorySpeed = cpu.defaultMemorySpeed
    }

    return Math.floor(
        (
            (cpu.coreClockMultiplier * cpu.frequency) +
            (cpu.memChannelsMultiplier * cpu.maxMemoryChannels) +
            (cpu.memClockMultiplier * memorySpeed) +
            (cpu.finalAdjustment)
        ) * multiplier
    )
}

function GRAPHupdateHeight(lines) { //to future me: don't try to change the height in function  of the number of bars
    document.getElementById("test").style.height = lines * 3 + 50 + "vh";
}

//Get the custom frequencies from the sessionStorage and replace them in the specified array
//Returns an array
function GRAPHreplaceCPU(array) {
    var custom = JSON.parse(sessionStorage.getItem("freq"))
    for (cpu in array) {
        for (cust in custom) {
            if (custom[cust].name == array[cpu].fullName) {
                array[cpu].frequency = parseInt(custom[cust].freq)
            }
        }
    }
    return array
}

//Gives the position of the different corresponding parts from the array. Using toLowerCase() so it's more user-friendly. 
//Should return an array of numbers
function getNumberInArray(array, key) {
    if (key == "") { return false }
    var i = 0
    var result = []
    for (el in array) {
        if (JSON.stringify(array[el].fullName).toLowerCase().includes(key.toLowerCase())) {
            result.push(i)
        }
        i++
    }
    return result
}

function scrollToSearch() {
    key = document.getElementById("search").value

    // this way if input is empty, every part will show up
    if (key == "") { key = " " }

    var toScroll = getNumberInArray(currentData, key)
    var it = -1
    var toScrollInGraph = []
    var indic = document.getElementById("scrollNumberIndic")
    indic.innerText = "0 / " + toScroll.length


    for (tick in toScroll) {
        toScrollInGraph.push(myChart.boxes[3]._labelItems[toScroll[tick]].y)
    }

    //return the index of the closest y value
    var closest = toScrollInGraph.reduce((a, b) => {
        return Math.abs(b - window.scrollY) < Math.abs(a - window.scrollY) ? b : a
    });
    it = toScrollInGraph.indexOf(closest)
    indic.innerText = (it + 1) + " / " + toScroll.length

    //these are to reset the eventListeners (when cloning they don't keep the events)
    var el = document.getElementById("scrollToNext"),
        elClone = el.cloneNode(true)
    el.parentNode.replaceChild(elClone, el)
    document.getElementById("scrollToNext").addEventListener("click", function() {
        it++

        //When hitting the end of the page, scroll back to the top
        if (it >= toScroll.length) {
            it = 0
        }

        //scroll (in px) = height mentioned in the chart - height of the previous line
        let y = myChart.boxes[3]._labelItems[toScroll[it]].y - myChart.boxes[3]._labelItems[toScroll[it]].font.lineHeight

        //We need to remove temporarily the window event so it doesn't get triggered when scrolling with the buttons
        window.removeEventListener('scroll', scrollToSearch)
        window.scrollTo({ top: y, behavior: 'smooth' })
        indic.innerText = (it + 1) + " / " + toScroll.length

        //On a timer, because the scrolling is 𝓈 𝓂 𝑜 𝑜 𝓉 𝒽
        setTimeout(() => { window.addEventListener('scroll', scrollToSearch) }, 200)
    })

    var el = document.getElementById("scrollToPrevious"),
        elClone = el.cloneNode(true)
    el.parentNode.replaceChild(elClone, el)

    document.getElementById("scrollToPrevious").addEventListener("click", function() {
        it--

        //Same as before, just this time you go to the bottom
        if (it < 0) {
            it = toScroll.length - 1
        }

        let y = myChart.boxes[3]._labelItems[toScroll[it]].y - myChart.boxes[3]._labelItems[toScroll[it]].font.lineHeight
        window.removeEventListener('scroll', scrollToSearch)
        window.scrollTo({ top: y, behavior: 'smooth' })
        indic.innerText = (it + 1) + " / " + toScroll.length
        setTimeout(() => { window.addEventListener('scroll', scrollToSearch) }, 200)
    })
}

//https://stackoverflow.com/questions/19799777/how-to-add-transparency-information-to-a-hex-color-code
//Returns an hex code
const setOpacity = (hex, alpha) => `${hex}${Math.floor(alpha * 255).toString(16).padStart(2, 0)}`;

//https://supunkavinda.blog/js-detect-outside-click
//Returns a boolean
function outsideClick(event, notelem) {
    notelem = $(notelem); // jquerize (optional)
    // check outside click for multiple elements
    var clickedOut = true,
        i, len = notelem.length;
    for (i = 0; i < len; i++) {
        if (event.target == notelem[i] || notelem[i].contains(event.target)) {
            clickedOut = false;
        }
    }
    if (clickedOut) return true;
    else return false;
}

function handleClickFilters(e) {
    if (outsideClick(e, document.getElementById("filters")) && outsideClick(e, document.getElementById("enableFilters"))) {
        $("#filters").hide("fast")
    }
}