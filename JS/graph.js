var previousType
var currentData = []

function updateGraph(priority, compatibleSort) {
    currentData = []
    var replacedCustom = []

    var realTime = false
    var type = document.getElementById("type").value
    var score = document.getElementById("sortType")
    var filterValue = document.getElementById("filterValue").value
    var filterValueBis = document.getElementById("filterValueBis").value
    var filterType = document.getElementById("sortTypeFilter").value
    var filterTypeBis = document.getElementById("sortTypeFilterBis").value

    var scaleType

    //Reset the legend if the type was changed
    if (typeof previousType != "undefined" && previousType != type) {
        window.scrollTo({ top: 0 })
        legendBase = []
    }

    //for when the autoupdating is disabled
    if (!priority && document.getElementById("autoUpdateInputs").checked) {
        return false
    }

    //switch graph type
    if (document.getElementById("logarithmicCheck").checked) {
        scaleType = "logarithmic"
    } else {
        scaleType = "linear"
    }

    currentData = GRAPHextractArray(currentData, type);

    //first filter
    if (filterValue != "") {
        let sortOrder = document.getElementById("sortOrderFilter").value
        if (sortOrder == "==") {
            currentData = currentData.filter(part => part[filterType].toString().includes(filterValue))
        }
        if (sortOrder == ">") {
            currentData = currentData.filter(part => part[filterType] > filterValue)
        }
        if (sortOrder == "<") {
            currentData = currentData.filter(part => part[filterType] < filterValue)
        }
    }

    //socket and multiGPU filter
    if (compatibleSort != undefined) {
        for (item in compatibleSort) {
            if (typeof compatibleSort[item] == "object") {
                //This is to check if the motherboard can fit both GPUs (some GPUs are 3 slots tall)
                currentData = getFilteredArrayGreater(currentData, compatibleSort[item].key, compatibleSort[item].low, compatibleSort[item].high)
            } else {
                currentData = filterArray(currentData, compatibleSort[item])
            }
        }
    }

    //second filter
    if (filterValueBis != "") {
        let sortOrder = document.getElementById("sortOrderFilterBis").value
        if (sortOrder == "==") {
            currentData = currentData.filter(part => part[filterTypeBis].includes(filterValueBis))
        }
        if (sortOrder == ">") {
            currentData = currentData.filter(part => part[filterTypeBis] > filterValueBis)
        }
        if (sortOrder == "<") {
            currentData = currentData.filter(part => part[filterTypeBis] < filterValueBis)
        }
    }

    GRAPHupdateHeight(currentData.length)

    //??? it's probably a fix for smth but idk what
    replacedCustom = currentData

    //when the custom frequency is enabled
    if (JSON.parse(sessionStorage.getItem("freq"))[0] != null && type == "cpus") {
        realTime = true
        replacedCustom = GRAPHreplaceCPU(currentData)
    }

    //when the ram speed thing is enabled
    if (document.getElementById("ram").value != "" && type == "cpus") {
        realTime = true
    }

    //?????????????????????????? y did I add this again
    if (!realTime || type != "cpus") {
        replacedCustom = currentData
    }

    if (realTime) {
        for (cpu in replacedCustom) {
            replacedCustom[cpu].basicCustomScore = GRAPHgetCPUScore(replacedCustom[cpu], 298, document.getElementById("ram").value)
            replacedCustom[cpu].partCustomRanking = GRAPHgetCPUScore(replacedCustom[cpu], 100, document.getElementById("ram").value)
        }
    }

    //sort in the right order (should)
    if (score.value != "STV") {
        if (score.value == "basicCPUScore" && realTime) {
            replacedCustom = sortArray(replacedCustom, "basicCustomScore", document.getElementById("sort").value, 0)
        } else {
            replacedCustom = sortArray(replacedCustom, score.value, document.getElementById("sort").value, 0)
        }
    } else {
        replacedCustom = sortArray(replacedCustom, 0, document.getElementById("sort").value)
    }

    if (id('ram').value != null && score.value == "defaultMemorySpeed") {
        alert("When using custom ram speed, the bars won't change, the score will do tho")
    }

    //https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors
    function LightenDarkenColor(col, amt) {
        let usePound = false;
        if (col[0] == "#") {
            col = col.slice(1);
            usePound = true;
        }
        let num = parseInt(col, 16);

        let r = (num >> 16) + amt;
        if (r > 255) r = 255;
        else if (r < 0) r = 0;

        let b = ((num >> 8) & 0x00FF) + amt;
        if (b > 255) b = 255;
        else if (b < 0) b = 0;

        let g = (num & 0x0000FF) + amt;
        if (g > 255) g = 255;
        else if (g < 0) g = 0;
        return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
    }

    //Need to make a new chart each time so they doesnt overlap
    if (myChart != undefined) {
        myChart.destroy();
    }

    var chartData = {
        labels: [],
        datasets: []
    }

    //List the legends color (should loop)
    var colors = ["#d9b400", "#d8a100", "#d77a00", "#da5a00", "#de3900", "#e11700", "#e4000c", "#e80030", "#eb0055", "#ee007b", "#f200a2", "#f500ca", "#f800f4", "#da00fc", "#b500ff"]
    var required = []

    //Select the right datasets for the current type
    switch (type) {
        case "gpus":
            required.push("price", "baseCoreClock", "level", "vram", "maxCoreClock", "baseMemClock", "maxMemClock", "watts", "singleGPUGraphicsScore", "singleGPUMaxGraphicsScore", "partRankingScore", "doubleGPUGraphicsScore", "doubleGPUMaxGraphicsScore", "stv")
            if (previousType != type) legendBase.push("Score", "Part Ranking")
            break;
        case "cpus":
            required.push("frequency", "maxFrequency", "defaultMemorySpeed", "price", "wattage", "level", "stv", "basicScore", "maxCPUScore", "partRankingScore")
            if (previousType != type) legendBase.push("Score", "Part Ranking")
            break;
        case "ram":
            required.push("price", "sellPrice", "frequency", "maxFrequency", "pricePerGig", "level", "totalSizeGB", "stv")
            if (previousType != type) legendBase.push("Freq", "Total Size (GB)")
            break;
        case "mobos":
            required.push("maxMemorySpeed", "price", "sellPrice", "defaultMemorySpeed", "level", "sellPrice", "m2Slots", "m2SlotsSupportingHeatsinks", "stv")
            if (previousType != type) legendBase.push("Price")
            break;
        case "storage":
            required.push("price", "sellPrice", "sizeGB", "level", "speed", "stv")
            if (previousType != type) legendBase.push("Transfer Speed", "Price")
            break;
        case "coolers":
            required.push("airFlow", "price", "sellPrice", "Level")
            if (previousType != type) legendBase.push("Price")
            break;
    }

    //Convert the name of the data selectionned to the label of the dataset (in the legend)
    var labelDictionnary = {
        "price": "Price",
        "level": "Unlocked at level",
        "Level": "Unlocked at level",
        "stv": document.getElementById("ratioTypeFilter").options[document.getElementById("ratioTypeFilter").selectedIndex].text + " to " + document.getElementById("ratioTypeFilterBis").options[document.getElementById("ratioTypeFilterBis").selectedIndex].text,
        "frequency": "Freq",
        "maxFrequency": "Max Freq",
        "defaultMemorySpeed": "Default Mem Freq",
        "wattage": "Watts consumed",
        "basicScore": "Score",
        "maxCPUScore": "Max Score",
        "partRankingScore": "Part Ranking",
        "baseCoreClock": "Base Core Clock",
        "vram": "VRAM (GB)",
        "maxCoreClock": "Max Core Clock",
        "baseMemClock": "Base VRAM Clock",
        "maxMemClock": "Max VRAM Clock",
        "watts": "Watts consumed",
        "singleGPUGraphicsScore": "Score",
        "singleGPUMaxGraphicsScore": "Max Score",
        "doubleGPUGraphicsScore": "Dual Score",
        "doubleGPUMaxGraphicsScore": "Max Dual Score",
        "totalSizeGB": "Total Size (GB)",
        "sellPrice": "Sell Price",
        "SellPrice": "Sell Price",
        "m2Slots": "Number of M.2 Slots",
        "m2SlotsSupportingHeatsinks": "Number of M.2 Slots supporting heatsinks",
        "pricePerGig": "Price per GB",
        "sizeGB": "Total Size (GB)",
        "speed": "Transfer Speed",
        "Height": "Height (mm)",
        "airFlow": "Air Flow (CFM)",
    }

    //Loop around the datasets
    for (needed in required) {
        let currentOutput = {}
        currentOutput.data = []

        //Loop around the parts
        for (part in replacedCustom) {

            //In case of special instructions
            switch (required[needed]) {
                case "stv":
                    currentOutput.data.push(Math.round(replacedCustom[part][document.getElementById("ratioTypeFilter").value] / replacedCustom[part][document.getElementById("ratioTypeFilterBis").value] * 1000) / 1000)
                    break;
                case "basicScore":
                    if (type != "cpus") {
                        currentOutput.data.push(replacedCustom[part][required[needed]])
                        continue
                    } else if (realTime) {
                        if (replacedCustom[part].basicCustomScore < 0) {
                            replacedCustom[part].basicCustomScore = 0
                        }
                        currentOutput.data.push(replacedCustom[part].basicCustomScore)
                    } else {
                        if (replacedCustom[part].basicCPUScore < 0) {
                            replacedCustom[part].basicCPUScore = 0
                        }
                        currentOutput.data.push(replacedCustom[part].basicCPUScore)
                    }
                    break;
                case "partRankingScore":
                    if (type != "cpus") {
                        currentOutput.data.push(replacedCustom[part][required[needed]])
                        continue
                    } else if (realTime) {
                        if (replacedCustom[part].partCustomRanking < 0) {
                            replacedCustom[part].partCustomRanking = 0
                        }
                        currentOutput.data.push(replacedCustom[part].partCustomRanking)
                    } else {
                        if (replacedCustom[part].partRankingScore < 0) {
                            replacedCustom[part].partRankingScore = 0
                        }
                        currentOutput.data.push(replacedCustom[part].partRankingScore)
                    }
                    break;
                default:
                    currentOutput.data.push(replacedCustom[part][required[needed]])
                    break;
            }

            //Push the name of the part to the vertical labels, in an if because we only want it on the first loop
            if (needed == 0) chartData.labels.push(replacedCustom[part].fullName)
        }
        currentOutput.hidden = true
        currentOutput.label = labelDictionnary[required[needed]]

        //Select the color and loop if there's no other one (it doesnt go back to the start, just go back by one each time to get a gradient)
        let currentColor = needed >= colors.length ? colors[colors.length - (needed - colors.length)] : colors[needed]
        currentOutput.backgroundColor = setOpacity(currentColor, 0.5)
        currentOutput.borderColor = LightenDarkenColor(currentColor, -100)
        chartData.datasets.push(currentOutput)
    }

    //Show the right legend items
    for (bar in chartData.datasets) {
        chartData.datasets[bar].barPercentage = 0.8
        chartData.datasets[bar].borderWidth = 1
        for (barBis in legendBase) {
            if (legendBase[barBis] == chartData.datasets[bar].label) {
                chartData.datasets[bar].hidden = false
            }
        }
    }

    var ctx = document.getElementById('myChart').getContext('2d');

    myChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: chartData,
        options: {
            animation: {
                duration: 0
            },
            legend: {
                onClick: function(evt, legendItem) {
                    countLegend(legendItem)
                    Chart.defaults.global.legend.onClick.call(this, evt, legendItem)
                },
                labels: {
                    fontColor: "#b3b2af",
                }
            },
            tooltips: {
                mode: 'index'
            },
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    gridLines: {
                        color: "#595959"
                    },
                    ticks: {
                        beginAtZero: true,
                    },
                    type: scaleType,
                }],
                yAxes: [{
                    gridLines: {
                        color: "#b3b2af"
                    },
                    ticks: {
                        fontColor: "#b3b2af",
                        fontSize: 18,
                        stepSize: 1,
                        beginAtZero: true,
                    }
                }],
            },
        }
    });

    //Keep score of the enabled datasets (doesnt work very well)
    var countLegend = function(legend) {
        for (type in legendBase) {
            if (legend.text.toLowerCase() == legendBase[type].toLowerCase()) {
                let index = legendBase.indexOf(legend.text);
                if (index > -1) {
                    legendBase.splice(index, 1);
                }
                return
            }
        }
        legendBase.push(legend.text)
    }
    previousType = type
    scrollToSearch()
}

function GRAPHupdateDropdown(type) {
    var score = document.getElementById("sortType")

    //Changes the filters depending on the type selected
    switch (type) {
        case "gpus":
            document.getElementById("customCPU").style.display = "none"
            var numberFiltersChoice = `
            <option value="price">Price</option>
            <option value="level">Level</option>
            <option value="watts">Wattage</option>
            <option value="vram">VRAM</option>
            <option value="baseCoreClock">Base core frequency</option>
            <option value="maxCoreClock">OC core frequency</option>
            <option value="baseMemClock">Base memory speed</option>
            <option value="maxMemClock">OC memory speed</option>
            <option value="singleGPUGraphicsScore" selected>Single GPU score</option>
            <option value="singleGPUMaxGraphicsScore">OC Single GPU score</option>
            <option value="doubleGPUGraphicsScore">Dual GPU score</option>
            <option value="doubleGPUMaxGraphicsScore">OC Dual GPU Score</option>
            <option value="partRankingScore">Part Ranking</option>
            `
            var txtFiltersChoice = `
            <option value="fullName">Name</option>
            <option value="gpuType">Cooling type</option>
            <option value="STV">... to ...</option>
            `
            break;
        case "cpus":
            document.getElementById("customCPU").style.display = "inline-block"
            var numberFiltersChoice = `    
            <option value="basicCPUScore" selected>Score</option>
            <option value="maxCPUScore">OC Score</option>
            <option value="partRankingScore">Part ranking</option>
            <option value="frequency">Frequency</option>
            <option value="maxFrequency">Max OC freq</option>
            <option value="cores">Number of cores</option>
            <option value="defaultMemorySpeed">Memory Speed</option>
            <option value="wattage">Wattage</option>
            <option value="price">Price</option>
            <option value="level">Level unlock</option>
            `
            var txtFiltersChoice = `
            <option value="manufacturer">Manufacturer</option>
            <option value="cpuSocket">Socket</option>
            <option value="STV">... to ...</option>
            `
            break;
        case "ram":
            document.getElementById("customCPU").style.display = "none"
            var numberFiltersChoice = `
            <option value="frequency" selected>Frequency</option>
            <option value="maxFreq">Max OC freq</option>
            <option value="pricePerGig">Price per gigabyte</option>
            <option value="level">Level unlock</option>
            <option value="price">Buy price</option>
            <option value="sellPrice">Sell price</option>
            <option value="totalSizeGb">Size</option>
            `
            var txtFiltersChoice = `
            <option value="manufacturer">Manufacturer</option>
            <option value="STV">... to ...</option>
            `
            break;
        case "mobos":
            document.getElementById("customCPU").style.display = "none"
            var numberFiltersChoice = `
            <option value="level">Level unlocked</option>
            <option value="price">Buy price</option>
            <option value="sellPrice">Sell price</option>
            <option value="defaultMemorySpeed">Default memory speed</option>
            <option value="maxMemorySpeed">Max memory speed</option>
            <option value="m2Slots">M.2 Slots number</option>
            <option value="m2SlotsSupportingHeatsinks">M.2 Slots supporting heatsinks</option>
            <option value="ramSlots">RAM slots</option>
            `
            var txtFiltersChoice = `
            <option value="manufacturer">Manufacturer</option>
            <option value="cpuSocket">Socket</option>
            <option value="chipset" selected>Chipset</option>
            <option value="motherboardSize">Motherboard form factor</option>
            <option value="ramType">Ram type</option>
            <option value="STV">... to ...</option>
            `
            break;
        case "storage":
            document.getElementById("customCPU").style.display = "none"
            var numberFiltersChoice = `
            <option value="level">Level unlocked</option>
            <option value="price">Buy price</option>
            <option value="sellPrice">Sell price</option>
            <option value="size">Total size</option>
            <option value="speed" selected>Transfer speed</option>
            `
            var txtFiltersChoice = `
            <option value="manufacturer">Manufacturer</option>
            <option value="STV">... to ...</option>
            `
            break;
        case "coolers":
            document.getElementById("customCPU").style.display = "none"
            var numberFiltersChoice = `
            <option value="Level">Level unlocked</option>
            <option value="price">Buy price</option>
            <option value="SellPrice">Sell price</option>
            <option value="Air Flow" selected>Air Flow (CFM)</option>
            <option value="Height">Height (mm)</option>
            `
            var txtFiltersChoice = `
            <option value="type">Type</option>
            <option value="manufacturer">Manufacturer</option>
            <option value="STV">... to ...</option>
            `
            break;

    }
    score.innerHTML = numberFiltersChoice
    score.innerHTML += txtFiltersChoice
    document.getElementById("ratioTypeFilter").innerHTML = document.getElementById("ratioTypeFilterBis").innerHTML = numberFiltersChoice
    document.getElementById("ratioTypeFilterBis").value = "price"
    document.getElementById("sortTypeFilter").innerHTML = document.getElementById("sortTypeFilterBis").innerHTML = score.innerHTML
    document.getElementById("sortTypeFilterBis").value = type == "coolers" ? "type" : "level"
}

function GRAPHstore(value) {
    var alreadyEntered = JSON.parse(sessionStorage.getItem("freq"))
    if (myChart.data.labels.length > 1 && showMoreCPUs) {
        if (!confirm("More than 1 CPU selected, storing for the first...")) {
            showMoreCPUs = false
        }
    }
    for (cpu in alreadyEntered) {
        if (alreadyEntered[cpu].name == myChart.data.labels[0]) {
            alreadyEntered[cpu].freq = value
            sessionStorage.setItem("freq", JSON.stringify(alreadyEntered))
            return
        }
    }
    var needToPush = {
        "name": myChart.data.labels[0],
        "freq": value
    }
    alreadyEntered.push(needToPush)
    sessionStorage.setItem("freq", JSON.stringify(alreadyEntered))
}

function showPartDetails(part) {
    sessionStorage.setItem("currentlyScrolledTo", Number(document.getElementById("scrollNumberIndic").innerText.split(" /")[0]))
    var type = document.getElementById("type").value
    var partDetails = myData[type][part]
    switch (type) {
        case "cpus":
            var customText = `
            <h1 style="margin-left: auto; margin-right: auto">${partDetails.fullName}</h1>
            <div style="text-align: left; vertical-align: top; display: inline-block; font-size: 1.3rem">
            <h3 style="margin: 0px;">CPU</h3>
            <p style="margin: 0px; margin-left: 20px">
                Socket : ${partDetails.cpuSocket}
                <br> <input type="button" value="show compatible mobos" onclick="goBack('yes'); document.getElementById('type').value = 'mobos'; updateGraph(true, ['${partDetails.cpuSocket}'])">
                <br> Processor series : ${partDetails.series}
                <br> Max number of RAM sticks : ${partDetails.maxMemoryChannels * 2}
                <br> Number of cores : ${partDetails.cores}
                ${partDetails.isHEMPart ? "<br> Modded" : ""}
            </p>
            <h3 style="margin: 0px;">Clocks</h3>
            <p style="margin: 0px; margin-left: 20px">
                Base frequency : ${partDetails.frequency} MHz
                <br> ${partDetails.canOverclock == "Yes" ? "Can be overclocked :" : "Cannot be overclocked"}
                ${partDetails.canOverclock == "Yes" ? '<br> Max frequency (stock voltage) : ' + partDetails.maxFrequency + " MHz":""}
                ${partDetails.canOverclock == "Yes" ? '<br> Theoretical max frequency (not sure) : ' + partDetails.maxFrequency*110/100*1.05 + " MHz":""}
            </p>
            <h3 style="margin: 0px;">Scores</h3>
            <p style="margin: 0px; margin-left: 20px">
                Base score : ${partDetails.basicCPUScore}
                <br> OC score : ${partDetails.maxCPUScore}
            </p>
            <h3 style="margin: 0px;">Power / thermals</h3>
            <p style="margin: 0px; margin-left: 20px">
                Stock voltage : ${partDetails.voltage} V
                <br> Theoretical max voltage : ${partDetails.maxVoltage} V
                <br> Wattage consumed : ${partDetails.wattage} W
                <br> Thermal throttling at : ${partDetails.thermalThrottling} °C
            </p>
            <h3 style="margin: 0px;">Shop</h3>
            <p style="margin: 0px; margin-left: 20px">
                Buy price : ${partDetails.price} $
                <br> Sell price : ${partDetails.sellPrice} $
                <br> Unlockation level : ${partDetails.level}
            </p>
            </div>`
            break;
        case "gpus":
            /*var cc = partDetails.baseCoreClock
            var mc = partDetails.baseMemClock
            var mcc = partDetails.maxCoreClock
            var mmc = partDetails.maxMemClock
            <br> Theorical max core frequency (with binning) : ${maxOCGpuCoreClock}
            <br> Theorical max memory frequency (with binning) : ${maxOCGpuMemClock}                
            var maxOCGpuCoreClock = mcc + Math.abs(Math.round((mcc - (cc - (mcc - cc)))*0.25) - ((mcc + Math.round((mcc - (cc -  (mcc - cc)))*0.25)%100))) + 100
            var maxOCGpuMemClock = mcc + Math.abs(Math.round((mmc - (mc - (mmc - mc)))*0.25) - ((mcc + Math.round((mmc - (mc -  (mmc - mc)))*0.25)%100))) + 100*/
            var compatibleButton = partDetails.multiGpu == "None" ? "" : `<input type="button" value="show ${partDetails.multiGpu} compatible mobos" onclick="goBack('yes'); document.getElementById('type').value = 'mobos'; updateGraph(true, ['${partDetails.multiGpu}', {key: 'maxMultiSize', low: ${partDetails.slotSize}, high: 99,}])">`
            var customText = `
            <h1 style="margin-left: auto; margin-right: auto">${partDetails.fullName}</h1>
            <div style="text-align: left; vertical-align: top; display: inline-block; font-size: 1.3rem">
                <h3 style="margin: 0px;">GPU</h3>
                <p style="margin: 0px; margin-left: 20px">
                    Chipset : ${partDetails.chipset}
                    <br> Chipset series : ${partDetails.chipsetSeries}
                    <br> Chipset brand : ${partDetails.chipsetBrand}
                    <br> VRAM : ${partDetails.vram} GB
                    <br> GPU Cooling type : ${partDetails.gpuType}
                    <br> Lighting : ${partDetails.lights == ""? "None":partDetails.lights}
                    <br> Size (in slots) : ${partDetails.slotSize}
                    ${partDetails.isHEMPart ? "<br> Modded" : ""}
                </p>
                <h3 style="margin: 0px;">Clocks</h3>
                <p style="margin: 0px; margin-left: 20px">
                    Base core frequency : ${partDetails.baseCoreClock}
                    <br> Base memory frequency : ${partDetails.baseMemClock}
                    <br> Max core frequency : ${partDetails.maxCoreClock}
                    <br> Max memory frequency : ${partDetails.maxMemClock}
                </p>
                <h3 style="margin: 0px;">Scores</h3>
                <p style="margin: 0px; margin-left: 20px">
                    Base score : ${partDetails.singleGPUGraphicsScore}
                    <br> OC score : ${partDetails.singleGPUMaxGraphicsScore}
                    <br> Dual score : ${partDetails.doubleGPUGraphicsScore}
                    <br> OC dual score : ${partDetails.doubleGPUMaxGraphicsScore}
                    <br> Part ranking : ${partDetails.partRankingScore}
                </p>
                <h3 style="margin: 0px;">Thermals</h3>
                <p style="margin: 0px; margin-left: 20px">
                    Wattage consumed (at stock speeds) : ${partDetails.watts} W
                    <br> Thermal throttling (bsod) at : ${partDetails.thermalThrottling} °C
                </p>
                <h3 style="margin: 0px;">Multi GPU</h3>
                <p style="margin: 0px; margin-left: 20px">
                    Multi GPU support : ${partDetails.multiGpu}
                    <br>${compatibleButton}
                </p>
                <h3 style="margin: 0px;">Shop</h3>
                <p style="margin: 0px; margin-left: 20px">
                    Buy price : ${partDetails.price}
                    <br> Sell price : ${partDetails.sellPrice}
                    <br> Unlocked at level : ${partDetails.level}
                </p>
            </div>`
            break;
        case "ram":
            var customText = `
            <h1 style="margin-left: auto; margin-right: auto">${partDetails.fullName}</h1>
                <div style="text-align: left; vertical-align: top; display: inline-block; font-size: 1.3rem">
                        <h3 style="margin: 0px;">Technical</h3>
                        <p style="margin: 0px; margin-left: 20px">
                            Base frequency : ${partDetails.frequency} MHz
                            <br> Max frequency : ${partDetails.maxFrequency} MHz
                            <br> Base voltage : ${partDetails.voltage} V
                            <br> Max voltage (in base game) : ${partDetails.maxVoltage} V
                            <br> Theoretical max voltage (in base game) : ${Number(partDetails.maxVoltage) * 110 / 100 * 1.05} V
                            <br> Size of one stick : ${partDetails.totalSizeGB} GB
                            ${partDetails.ramType == "DDR4" ? "" : "<br> Special type of RAM : " + partDetails.ramType}
                            ${partDetails.lightning == "None" ? "" : "<br> Lightning : " + partDetails.lightning}
                        </p>
                        <h3 style="margin: 0px;">Shop</h3>
                            Manufacturer : ${partDetails.manufacturer}
                            <br> Buy price : ${partDetails.price}
                            <br> Sale price : ${partDetails.sellPrice}
                            <br> Unlocked at level : ${partDetails.level}
                        </p>
                    <input type="button" value="show compatible mobos" onclick="goBack('yes'); document.getElementById('type').value = 'mobos'; updateGraph(true, ['${partDetails.ramType}'])">
                </div>`
            break;
        case "mobos":
            var customText = `
            <h1 style="margin-left: auto; margin-right: auto">${partDetails.fullName}</h1>
                <div style="text-align: left; vertical-align: top; display: inline-block; font-size: 1.3rem">
                        <h3 style="margin: 0px;">CPU</h3>
                        <p style="margin: 0px; margin-left: 20px">
                            Socket : ${partDetails.cpuSocket}
                            <br> Chipset : ${partDetails.chipset}
                            <br> Support overclocking : ${partDetails.canOverclock}
                        </p>
                        <h3 style="margin: 0px;">RAM</h3>
                            <p style="margin: 0px; margin-left: 20px">
                            Number of RAM slots : ${partDetails.ramSlots}
                            ${partDetails.ramType == "DDR4" ? "" : "<br> Special type of RAM : " + partDetails.ramType}
                            <br> Max RAM Speed : ${partDetails.maxMemorySpeed}
                        </p>
                        <h3 style="margin: 0px;">Shop</h3>
                        <p style="margin: 0px; margin-left: 20px">
                            Buy price : ${partDetails.price}
                            <br> Sale price : ${partDetails.sellPrice}
                            <br> Unlocked at level : ${partDetails.level}
                        </p>
                        <h3 style="margin: 0px;">GPU</h3>
                        <p style="margin: 0px; margin-left: 20px">
                            ${partDetails.supportCrossfire == "Yes" ? partDetails.supportSLI == "Yes" ? "Multi GPU: SLI/Crossfire" : "Multi GPU: Crossfire" : "Multi GPU: None"}
                        </p>
                        <h3 style="margin: 0px;">Storage</h3>
                        <p style="margin: 0px; margin-left: 20px">
                            M.2 Slots : ${partDetails.m2Slots}
                            <br> Number of M.2 slots supporting Heatsinks : ${partDetails.m2SlotsSupportingHeatsinks}
                            <br> SATA slots usable : ${partDetails.sataSlots}
                        </p>
                        <h3 style="margin: 0px;">Technical</h3>
                        <p style="margin: 0px; margin-left: 20px">
                            Size : ${partDetails.motherboardSize}
                            ${partDetails.lightning == "None" ? "" : "<br> Lightning : " + partDetails.lightning}
                            ${partDetails.isHEMPart ? "<br> Modded" : ""}
                        </p>
                </div>`
            break
        case "storage":
            var customText = `
            <h1 style="margin-left: auto; margin-right: auto">${partDetails.fullName}</h1>
                <div style="text-align: left; vertical-align: top; display: inline-block; font-size: 1.3rem">
                <h3 style="margin: 0px;">Specifications</h3>
                <p style="margin: 0px; margin-left: 20px">
                    Total size (in GB) : ${partDetails.sizeGB}
                    <br> Transfer speed : ${partDetails.speed}
                    <br> Manufacturer : ${partDetails.manufacturer}
                    <br> Type : ${partDetails.type}
                    ${partDetails.type == "M2" ? "<br> Uses heatsink : " + partDetails.includesHeatsink + (partDetails.includesHeatsink == "Yes" ? "<br> Heatsink T H I C Cness: " + partDetails.heatsinkThickness: "") : ""}
                    ${partDetails.lightning != "N/A" ? "<br> Lightning : " + partDetails.lightning : ""}
                    ${partDetails.isHEMPart ? "<br> Modded" : ""}
                </p>
                <h3 style="margin: 0px;">Shop</h3>
                <p style="margin: 0px; margin-left: 20px">
                    Price : ${partDetails.price}
                    <br> Sell price : ${partDetails.sellPrice}
                    <br> Unlocked at level : ${partDetails.level}
                </p>
                </div>`
            break;
        case "coolers":
            var customText = `
            <h1 style="margin-left: auto; margin-right: auto">${partDetails.fullName}</h1>
            <div style="text-align: left; vertical-align: top; display: inline-block; font-size: 1.3rem">
            <h3 style="margin: 0px;">Performance</h3>
            <p style="margin: 0px; margin-left: 20px">
                Air Flow : ${partDetails.airFlow} CFM
                ${partDetails.airPressure == undefined || partDetails.airPressure == '' ? '' : `<br> Air Pressure : ${partDetails.airPressure}`}
                ${partDetails.thickness == 0 || partDetails.thickness == undefined ? `` : `<br> Radiator thickness : ${partDetails.thickness} mm`}
                <br> Type : ${partDetails.type}
                ${partDetails.noFan ? '<br> Passive' : ''}
            </p>
            <h3 style="margin: 0px;">Specifications</h3>
            <p style="margin: 0px; margin-left: 20px">
                Lighting : ${partDetails.lighting}
                ${partDetails.Size == undefined ? '' : `<br> Size : ${partDetails.Size} mm`}
                ${partDetails.cpuSockets != undefined ? `<br> Supported CPU Sockets : ${partDetails.cpuSockets}` : ''}
                ${partDetails.Height != undefined && partDetails.Height != 0 ? `<br> Height : ${partDetails.Height} mm` : ''}
                ${partDetails.isHEMPart ? '<br> Modded' : ''}
            </p>
            <h3 style="margin: 0px;">Shop</h3>
            <p style="margin: 0px; margin-left: 20px">
                Price : ${partDetails.price} $
                <br> Sell price : ${partDetails.sellPrice} $
                <br> Unlocked at level : ${partDetails.Level}
            </p>
            </div>`
            break;
    }
    if (imageExists("imagesBackup/Texture2D/" + partDetails.iconPath + ".png")) {
        customText += `
            <div style="display: inline-block; border: 2px solid black; float: right;">
                <img src="imagesBackup/Texture2D/${partDetails.iconPath}.png"></img>
            </div>`
    } else {
        customText += `
            <div style="display: inline-block; border: 2px solid black; float: right;">
                <img src="imagesBackup/Texture2D/ERROR_NOT_FOUND.png"></img>
            </div>`
    }
    document.getElementById("divPartShower").innerHTML = customText
}