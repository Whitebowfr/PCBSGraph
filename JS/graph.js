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

    var basicScore = []
    var maxBasicScore = []
    var partRanking = []
    var fullName = []
    var dualScore = []
    var maxDualScore = []
    var frequency = []
    var maxFrequency = []
    var price = []
    var stv = []
    var sellPrice = []
    var defaultMemory = []
    var Watts = []
    var level = []
    var vram = []
    var memClock = []
    var maxMemClock = []
    var scaleType
    console.log(typeof previousType, type, legendBase)

    //Reset the legend if the type was changed
    if (typeof previousType != "undefined" && previousType != type) {
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
        var sortOrder = document.getElementById("sortOrderFilter").value
        if (sortOrder == "==") {
            currentData = currentData.filter(part => part[filterType] == filterValue)
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
        var sortOrder = document.getElementById("sortOrderFilterBis").value
        if (sortOrder == "==") {
            currentData = currentData.filter(part => part[filterTypeBis] == filterValueBis)
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

    //Push the correct information to the arrays later gived to the graph
    if (type == "cpus") {
        for (cpu in replacedCustom) {
            if (realTime) {
                if (replacedCustom[cpu].basicCustomScore < 0) {
                    replacedCustom[cpu].basicCustomScore = 0
                }

                if (replacedCustom[cpu].partCustomRanking < 0) {
                    replacedCustom[cpu].partCustomRanking = 0
                }
                basicScore.push(replacedCustom[cpu].basicCustomScore)
                partRanking.push(replacedCustom[cpu].partCustomRanking)
            } else {
                if (replacedCustom[cpu].basicCPUScore < 0) {
                    replacedCustom[cpu].basicCPUScore = 0
                }

                if (replacedCustom[cpu].partRankingScore < 0) {
                    replacedCustom[cpu].partRankingScore = 0
                }
                basicScore.push(replacedCustom[cpu].basicCPUScore)
                partRanking.push(replacedCustom[cpu].partRankingScore)
            }
            frequency.push(replacedCustom[cpu].frequency)
            maxFrequency.push(replacedCustom[cpu].maxFrequency)
            defaultMemory.push(replacedCustom[cpu].defaultMemorySpeed)
            price.push(replacedCustom[cpu].price)
            Watts.push(replacedCustom[cpu].wattage)
            fullName.push(replacedCustom[cpu].fullName)
            level.push(replacedCustom[cpu].level)
            stv.push(Math.round(replacedCustom[cpu][document.getElementById("ratioTypeFilter").value] / replacedCustom[cpu][document.getElementById("ratioTypeFilterBis").value] * 1000) / 1000)
        }
    }
    if (type == "gpus") {
        for (gpu in replacedCustom) {
            price.push(replacedCustom[gpu].price)
            frequency.push(replacedCustom[gpu].baseCoreClock)
            level.push(replacedCustom[gpu].level)
            vram.push(replacedCustom[gpu].vram)
            maxFrequency.push(replacedCustom[gpu].maxCoreClock)
            memClock.push(replacedCustom[gpu].baseMemClock)
            maxMemClock.push(replacedCustom[gpu].maxMemClock)
            Watts.push(replacedCustom[gpu].watts)
            basicScore.push(replacedCustom[gpu].singleGPUGraphicsScore)
            maxBasicScore.push(replacedCustom[gpu].singleGPUMaxGraphicsScore)
            partRanking.push(replacedCustom[gpu].partRankingScore)
            fullName.push(replacedCustom[gpu].fullName)
            dualScore.push(replacedCustom[gpu].doubleGPUGraphicsScore)
            maxDualScore.push(replacedCustom[gpu].doubleGPUMaxGraphicsScore)
            stv.push(Math.round(replacedCustom[gpu][document.getElementById("ratioTypeFilter").value] / replacedCustom[gpu][document.getElementById("ratioTypeFilterBis").value] * 1000) / 1000)
        }
    }
    if (type == "ram") {
        var size = []
        var pricePerGig = []
        for (ram in replacedCustom) {
            price.push(replacedCustom[ram].price)
            sellPrice.push(replacedCustom[ram].sellPrice)
            frequency.push(replacedCustom[ram].frequency)
            maxFrequency.push(replacedCustom[ram].maxFrequency)
            pricePerGig.push(replacedCustom[ram].pricePerGig)
            level.push(replacedCustom[ram].level)
            fullName.push(replacedCustom[ram].fullName)
            size.push(replacedCustom[ram].totalSizeGB)
            stv.push(Math.round(replacedCustom[ram][document.getElementById("ratioTypeFilter").value] / replacedCustom[ram][document.getElementById("ratioTypeFilterBis").value] * 1000) / 1000)
        }
    }
    if (type == "mobos") {
        var M2Slots = []
        var M2SlotsHeatSink = []
        for (mobo in replacedCustom) {
            maxFrequency.push(replacedCustom[mobo].maxMemorySpeed)
            price.push(replacedCustom[mobo].price)
            sellPrice.push(replacedCustom[mobo].sellPrice)
            frequency.push(replacedCustom[mobo].defaultMemorySpeed)
            level.push(replacedCustom[mobo].level)
            M2Slots.push(replacedCustom[mobo].m2Slots)
            M2SlotsHeatSink.push(replacedCustom[mobo].m2SlotsSupportingHeatsinks)
            fullName.push(replacedCustom[mobo].fullName)
            stv.push(Math.round(replacedCustom[mobo][document.getElementById("ratioTypeFilter").value] / replacedCustom[mobo][document.getElementById("ratioTypeFilterBis").value] * 1000) / 1000)
        }
    }
    if (type == "storage") {
        var size = []
        var transferSpeed = []
        for (s in replacedCustom) {
            price.push(replacedCustom[s].price)
            sellPrice.push(replacedCustom[s].sellPrice)
            size.push(replacedCustom[s].sizeGB)
            fullName.push(replacedCustom[s].fullName)
            level.push(replacedCustom[s].level)
            transferSpeed.push(replacedCustom[s].speed)
            stv.push(Math.round(replacedCustom[s][document.getElementById("ratioTypeFilter").value] / replacedCustom[s][document.getElementById("ratioTypeFilterBis").value] * 1000) / 1000)
        }
    }

    //Need to make a new chart each time so they doesnt overlap
    if (myChart != undefined) {
        myChart.destroy();
    }


    //the different datasets
    var dualScoreData = {
        label: "Dual GPU Score",
        data: dualScore,
        hidden: true,
        backgroundColor: 'rgba(102, 81, 145, 0.5)',
        borderColor: 'rgba(120,88,186,1)',
    }
    var levelData = {
        label: "Level",
        data: level,
        hidden: true,
        backgroundColor: 'rgba(207, 205, 9, 0.5)',
        borderColor: 'rgba(224,223,91,1)',
    }
    var vramData = {
        label: "VRAM",
        data: vram,
        hidden: true,
        backgroundColor: 'rgba(255, 124, 67, 0.5)',
        borderColor: 'rgba(255,144,96,1)',
    }
    var memClockData = {
        label: "Memory Clock",
        data: memClock,
        hidden: true,
        backgroundColor: 'rgba(249, 93, 106, 0.5)',
        borderColor: 'rgba(249,115,126,1)',
    }
    var ocMemClockData = {
        label: "Max Memory Clock",
        data: maxMemClock,
        hidden: true,
        backgroundColor: 'rgba(250, 81, 52, 0.5)',
        borderColor: 'rgba(252,117,94,1)',
    }
    var ocSingleScoreData = {
        label: "OC score",
        data: maxBasicScore,
        hidden: true,
        backgroundColor: 'rgba(212, 80, 135, 0.5)',
        borderColor: 'rgba(230,80,143,1)',
    }
    var ocDualScoreData = {
        label: "OC Dual GPU Score",
        data: maxDualScore,
        hidden: true,
        backgroundColor: 'rgba(191, 67, 174, 0.5)',
        borderColor: 'rgba(198,71,180,1)',
    }
    var freqData = {
        label: "Frequency",
        data: frequency,
        hidden: true,
        backgroundColor: 'rgba(160, 100, 199, 0.5)',
        borderColor: 'rgba(122,81,149,1)',
    }
    var maxFreqData = {
        label: "Max Frequency",
        data: maxFrequency,
        hidden: true,
        backgroundColor: 'rgba(215, 80, 160, 0.5)',
        borderColor: 'rgba(188,80,144,1)',
    }
    var defaultMemoryData = {
        label: "Memory Speed",
        data: defaultMemory,
        hidden: true,
        backgroundColor: 'rgba(255, 49, 91, 0.5)',
        borderColor: 'rgba(239,86,117,1)',
    }
    var priceData = {
        label: "Price",
        data: price,
        hidden: true,
        backgroundColor: 'rgba(255, 124, 82, 0.5)',
        borderColor: 'rgba(255,101,52,1)',
    }
    var wattageData = {
        label: "Wattage",
        data: Watts,
        hidden: true,
        backgroundColor: 'rgba(255, 192, 75, 0.5)',
        borderColor: 'rgba(255,166,0,1)',
    }
    var sellPriceData = {
        label: "Sell price",
        data: sellPrice,
        hidden: true,
        backgroundColor: 'rgba(255, 255, 0, 0.5)',
        borderColor: 'rgba(200, 200, 0)',
    }
    var pricePerGigData = {
        label: "Price per gigabyte",
        data: pricePerGig,
        hidden: true,
        backgroundColor: 'rgba(191, 67, 174, 0.5)',
        borderColor: 'rgba(198,71,180,1)',
    }
    var sizeData = {
        label: "Total size (GB)",
        data: size,
        hidden: true,
        backgroundColor: 'rgba(212, 80, 135, 0.5)',
        borderColor: 'rgba(230,80,143,1)',
    }
    var scoreData = {
        label: "Score",
        hidden: true,
        data: basicScore,
        backgroundColor: 'rgba(0, 143, 209, 0.5)',
        borderColor: 'rgba(0,63,92,1)',
    }
    var partRankingData = {
        label: "Part Ranking",
        data: partRanking,
        hidden: true,
        backgroundColor: "rgba(79, 111,189,0.5)",
        borderColor: "rgba(55,76,128,1)",
    }
    var m2SlotsData = {
        label: "M2 Slots",
        data: M2Slots,
        hidden: true,
        backgroundColor: 'rgba(191, 67, 174, 0.5)',
        borderColor: 'rgba(198,71,180,1)'
    }
    var m2SlotsHeatData = {
        label: "M2 Slots supporting heatsinks",
        data: M2SlotsHeatSink,
        hidden: true,
        backgroundColor: 'rgba(212, 80, 135, 0.5)',
        borderColor: 'rgba(230,80,143,1)'
    }
    var transferSpeedData = {
        label: "Transfer speed",
        data: transferSpeed,
        hidden: true,
        backgroundColor: "rgba(79, 111,189,0.5)",
        borderColor: "rgba(55,76,128,1)"
    }
    var stvData = {
        label: document.getElementById("ratioTypeFilter").options[document.getElementById("ratioTypeFilter").selectedIndex].text + " to " + document.getElementById("ratioTypeFilterBis").options[document.getElementById("ratioTypeFilterBis").selectedIndex].text,
        data: stv,
        hidden: true,
        backgroundColor: "rgba(79, 111,189,0.5)",
        borderColor: "rgba(55,76,128,1)"
    }

    //The different datasets names are :
    //dualScoreData, vramData, memClockData, ocMemClockData, ocSingleScoreData, ocDualScoreData, scoreData, partRankingData
    //levelData, priceData, sellPriceData, freqData, maxFreqData, defaultMemoryData, wattageData, pricePerGigData, sizeData
    //transferSpeedData, stvData


    var chartData = {
        labels: fullName,
        datasets: []
    }


    //Push different datasets to the chart depending on the type

    if (type == "gpus") {
        chartData.datasets.push(scoreData, ocSingleScoreData, partRankingData, dualScoreData, ocDualScoreData, freqData, maxFreqData, memClockData, ocMemClockData, priceData, levelData, sellPriceData, wattageData, stvData)
    }
    if (type == "cpus") {
        chartData.datasets.push(scoreData, partRankingData, maxFreqData, defaultMemoryData, priceData, sellPriceData, levelData, wattageData, stvData)
    }
    if (type == "ram") {
        chartData.datasets.push(freqData, maxFreqData, sizeData, pricePerGigData, levelData, priceData, sellPriceData, stvData)
    }
    if (type == "mobos") {
        chartData.datasets.push(freqData, maxFreqData, priceData, sellPriceData, levelData, m2SlotsData, m2SlotsHeatData, stvData)
    }
    if (type == "storage") {
        chartData.datasets.push(sizeData, levelData, priceData, sellPriceData, transferSpeedData, stvData)
    }

    //reset the legend on type change
    if (previousType != type) {
        if (type == "gpus") {
            legendBase.push("Score", "Part Ranking")
        }
        if (type == "cpus") {
            legendBase.push("Score", "Part Ranking")
        }
        if (type == "ram") {
            legendBase.push("Frequency", "Total size (GB)")
        }
        if (type == "mobos") {
            legendBase.push("Price")
        }
        if (type == "storage") {
            legendBase.push("Transfer speed", "Price")
        }
    }

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
        console.log(legend.text)
        for (type in legendBase) {
            if (legend.text.toLowerCase() == legendBase[type].toLowerCase()) {
                var index = legendBase.indexOf(legend.text);
                if (index > -1) {
                    legendBase.splice(index, 1);
                }
                console.log(legendBase)
                return
            }
        }
        legendBase.push(legend.text)
        console.log(legendBase)
    }
    previousType = type
    console.log(previousType)
    scrollToSearch()
}

function GRAPHupdateDropdown(type) {
    var score = document.getElementById("sortType")

    //Changes the filters depending on the type selected
    if (type == "gpus") {
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
    }
    if (type == "cpus") {
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

    }
    if (type == "ram") {
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

    }
    if (type == "mobos") {
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

    }
    if (type == "storage") {
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

    }
    score.innerHTML = numberFiltersChoice
    score.innerHTML += txtFiltersChoice
    document.getElementById("ratioTypeFilter").innerHTML = numberFiltersChoice
    document.getElementById("ratioTypeFilterBis").innerHTML = numberFiltersChoice
    document.getElementById("ratioTypeFilterBis").value = "price"
    document.getElementById("sortTypeFilter").innerHTML = score.innerHTML
    document.getElementById("sortTypeFilterBis").innerHTML = score.innerHTML
    document.getElementById("sortTypeFilterBis").value = "level"
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
    var type = document.getElementById("type").value
    var partDetails = myData[type][part]
    if (type == "cpus") {
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
            </div>
        `
    }
    if (type == "gpus") {
        /*var cc = partDetails.baseCoreClock
        var mc = partDetails.baseMemClock
        var mcc = partDetails.maxCoreClock
        var mmc = partDetails.maxMemClock
        <br> Theorical max core frequency (with binning) : ${maxOCGpuCoreClock}
        <br> Theorical max memory frequency (with binning) : ${maxOCGpuMemClock}                
        var maxOCGpuCoreClock = mcc + Math.abs(Math.round((mcc - (cc - (mcc - cc)))*0.25) - ((mcc + Math.round((mcc - (cc -  (mcc - cc)))*0.25)%100))) + 100
        var maxOCGpuMemClock = mcc + Math.abs(Math.round((mmc - (mc - (mmc - mc)))*0.25) - ((mcc + Math.round((mmc - (mc -  (mmc - mc)))*0.25)%100))) + 100*/
        if (partDetails.multiGpu != "None") {
            var compatibleButton = `<input type="button" value="show ${partDetails.multiGpu} compatible mobos" onclick="goBack('yes'); document.getElementById('type').value = 'mobos'; updateGraph(true, ['${partDetails.multiGpu}', {key: 'maxMultiSize', low: ${partDetails.slotSize}, high: 99,}])">`
        } else {
            var compatibleButton = ""
        }
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
            </div>
        `
    }
    if (type == "ram") {
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
                </div>
        `
    }
    if (type == "mobos") {
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
                </div>
        `
    }
    if (type == "storage") {
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
                </div>
        `
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