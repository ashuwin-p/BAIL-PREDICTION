let chartInstance = null;

// Function to bin data based on a specified width
function binData(data, binWidth) {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const bins = [];

    for (let i = min; i <= max; i += binWidth) {
        bins.push(i);
    }

    console.log("Bins:", bins); // Log bin ranges

    const binnedData = Array(bins.length - 1).fill(0);
    data.forEach((value) => {
        for (let i = 0; i < bins.length - 1; i++) {
            if (value >= bins[i] && value < bins[i + 1]) {
                binnedData[i]++;
                break;
            }
        }
    });

    return { bins: bins.slice(0, bins.length - 1), binnedData };
}

// Function to get binary counts (0/1)
function getBinaryCounts(data) {
    const binaryCounts = { 0: 0, 1: 0 };
    data.forEach((item) => {
        binaryCounts[item.label]++;
    });
    return binaryCounts;
}

// Function to get binary counts for each district
function getDistrictBinaryCounts(data) {
    const districtBinaryCounts = {};
    data.forEach(({ district, label }) => {
        if (!districtBinaryCounts[district]) {
            districtBinaryCounts[district] = { 0: 0, 1: 0 };
        }
        districtBinaryCounts[district][label]++;
    });
    return districtBinaryCounts;
}

// Prepare data for visualization
const districtCounts = {};
data.forEach(({ district }) => {
    if (district) {
        districtCounts[district] = (districtCounts[district] || 0) + 1;
    }
});

const districts = Object.keys(districtCounts);
const counts = Object.values(districtCounts);

// Word frequency data for visualization
const wordFrequencyData = {
    labels: ["कथन", "आशय", "गलत", "अदद", "जनपद", "शपथ", "बहन", "भय", "आकर", "नगर"],
    datasets: [{
        label: "Word Frequency",
        data: [3663, 1831, 1000, 963, 836, 823, 677, 573, 492, 460],
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
    }],
};

const wordFrequencyConfig = {
    type: "bar",
    data: wordFrequencyData,
    options: {
        responsive: true,
        scales: {
            x: { beginAtZero: true, title: { display: true, text: "Words" } },
            y: { beginAtZero: true, title: { display: true, text: "Frequency" } },
        },
        plugins: { legend: { display: true, position: "top" } },
    },
};

// Create initial charts
new Chart(document.getElementById("wordFrequencyBarChart"), wordFrequencyConfig);

const epochs = model_train.map(data => parseFloat(data.epoch));
const losses = model_train.map(data => parseFloat(data.loss));
const learningRates = model_train.map(data => parseFloat(data.learning_rate));

// Chart for Epoch vs Loss
const ctxLoss = document.getElementById('epochLossChart').getContext('2d');
const lossChart = new Chart(ctxLoss, {
    type: 'line',
    data: {
        labels: epochs,
        datasets: [{
            label: 'Loss',
            data: losses,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Epoch'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Loss'
                }
            }
        }
    }
});

// Chart for Epoch vs Learning Rate
const ctxLearningRate = document.getElementById('epochLearningRateChart').getContext('2d');
const learningRateChart = new Chart(ctxLearningRate, {
    type: 'line',
    data: {
        labels: epochs,
        datasets: [{
            label: 'Learning Rate',
            data: learningRates,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
        }]
    },
    options: {
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Epoch'
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Learning Rate'
                }
            }
        }
    }
});

new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
        labels: districts,
        datasets: [{
            label: "Number of Applications",
            data: counts,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
        }],
    },
    options: { responsive: true, scales: { y: { beginAtZero: true } } },
});

new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: {
        labels: districts,
        datasets: [{
            data: counts,
            backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40"],
        }],
    },
    options: {
        responsive: true,
        aspectRatio: 1.5,
        legend: {
            display: false
        }
    },
});


// Histogram for facts and arguments length
const factsArgumentsData = data.map(item => parseInt(item.facts_and_arguments_length) || 0);
const factBins = binData(factsArgumentsData, 100);

new Chart(document.getElementById("factsArgumentsHistogram"), {
    type: "bar",
    data: {
        labels: factBins.bins.map(bin => `${bin} - ${bin + 100}`),
        datasets: [{
            label: "Facts and Arguments Length",
            data: factBins.binnedData,
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
        }],
    },
    options: {
        responsive: true,
        scales: {
            x: { title: { display: true, text: "Length of Facts and Arguments" } },
            y: { title: { display:true,text:"Frequency" } }
        }
    }
});

// Histogram for judge opinion length
const judgeOpinionData = data.map(item => parseInt(item.judge_opinion_length) || 0);
const judgeBins = binData(judgeOpinionData, 50);

new Chart(document.getElementById("judgeOpinionHistogram"), {
    type:"bar",
     data:{
         labels : judgeBins.bins.map(bin => `${bin} - ${bin +50}`),
         datasets:[{
             label:"Judge Opinion Length",
             data : judgeBins.binnedData,
             backgroundColor :"rgba(255 ,99 ,132 ,0.5)",
             borderColor :"rgba(255 ,99 ,132 ,1)",
             borderWidth :1,
         }],
     },
     options:{
         responsive:true,
         scales:{
             x:{title:{display:true,text:"Length of Judge Opinions"}},
             y:{title:{display:true,text:"Frequency"}}
         }
     }
});

// Binary count pie chart for test data
const binaryCounts1 = getBinaryCounts(test_data);
new Chart(document.getElementById("binaryPieChart1"), {
   type:"pie",
   data:{
       labels:["Label0","Label1"],
       datasets:[{
           data:[binaryCounts1[0],binaryCounts1[1]],
           backgroundColor:["#FF6384","#36A2EB"],
       }],
   },
   options:{responsive:true ,maintainAspectRatio:true},
});

// District-wise binary count bar chart for test data
const districtBinaryCounts1 = getDistrictBinaryCounts(test_data);
new Chart(document.getElementById("districtBinaryBarChart1"),{
   type:"bar",
   data:{
       labels:Object.keys(districtBinaryCounts1),
       datasets:[
           {
               label:"Label0 Count",
               data:Object.values(districtBinaryCounts1).map(counts=>counts[0]),
               backgroundColor:"rgba(255 ,99 ,132 ,0.5)",
               borderColor:"rgba(255 ,99 ,132 ,1)",
               borderWidth :1,
           },
           {
               label:"Label1 Count",
               data:Object.values(districtBinaryCounts1).map(counts=>counts[1]),
               backgroundColor :"rgba(54 ,162 ,235 ,0.5)",
               borderColor :"rgba(54 ,162 ,235 ,1)",
               borderWidth :1,
           },
       ],
   },
   options:{
       responsive:true ,
       indexAxis:"y",
       scales:{
           x:{title:{display:true,text:"Count"}},
           y:{title:{display:true,text:"Districts"}},
       },
   },
});

// Binary count pie chart for train data
const binaryCounts2 = getBinaryCounts(train_data);
new Chart(document.getElementById("binaryPieChart2"),{
   type :"pie",
   data:{
       labels:["Label0","Label1"],
       datasets:[{
           data:[binaryCounts2[0],binaryCounts2[1]],
           backgroundColor:["#FF6384","#36A2EB"],
       }],
   },
   options:{responsive:true ,maintainAspectRatio:true},
});

// District-wise binary count bar chart for train data
const districtBinaryCounts2 = getDistrictBinaryCounts(train_data);
new Chart(document.getElementById("districtBinaryBarChart2"),{
   type :"bar",
   data:{
       labels:Object.keys(districtBinaryCounts2),
       datasets:[
           {
               label:"Label0 Count",
               data:Object.values(districtBinaryCounts2).map(counts=>counts[0]),
               backgroundColor :"rgba(255 ,99 ,132 ,0.5)",
               borderColor :"rgba(255 ,99 ,132 ,1)",
               borderWidth :1,
           },
           {
               label:"Label1 Count",
               data:Object.values(districtBinaryCounts2).map(counts=>counts[1]),
               backgroundColor :"rgba(54 ,162 ,235 ,0.5)",
               borderColor :"rgba(54 ,162 ,235 ,1)",
               borderWidth :1,
           },
       ],
   },
   options:{
       responsive:true ,
       indexAxis:"y",
       scales:{
           x:{title:{display:true,text:"Count"}},
           y:{title:{display:true,text:"Districts"}},
       },
   },
});

// Function to open modal and display charts
function openModal(chartId, title, inference) {
    const ctx = document.getElementById("modalChartCanvas").getContext("2d");
    if (chartInstance) {
        chartInstance.destroy();
    }

    switch (chartId) {
        case "barChart":
            chartInstance = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: districts,
                    datasets: [{
                        label: "Number of Applications",
                        data: counts,
                        backgroundColor: "rgba(75, 192, 192, 0.2)",
                        borderColor: "rgba(75, 192, 192, 1)",
                        borderWidth: 1,
                    }],
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { beginAtZero: true },
                    },
                },
            });
            break;

        case "pieChart":
            chartInstance = new Chart(ctx, {
                type: "pie",
                data: {
                    labels: districts,
                    datasets: [{
                        data: counts,
                        backgroundColor: [
                            "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40",
                        ],
                    }],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: "top", display: false },
                    },
                },
            });
            break;

        case "wordFrequencyBarChart":
            chartInstance = new Chart(ctx, wordFrequencyConfig);
            break;

        case "factsArgumentsHistogram":
            const factsArgumentsData = data.map(item => parseInt(item.facts_and_arguments_length) || 0);
            const factBins = binData(factsArgumentsData, 100);
            chartInstance = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: factBins.bins.map(bin => `${bin} - ${bin + 100}`),
                    datasets: [{
                        label: "Facts and Arguments Length",
                        data: factBins.binnedData,
                        backgroundColor: "rgba(54, 162, 235, 0.5)",
                        borderColor: "rgba(54, 162, 235, 1)",
                        borderWidth: 1,
                    }],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: { title: { display: true, text: "Length of Facts and Arguments" } },
                        y: { title: { display:true,text:"Frequency" } }
                    }
                }
            });
            break;

        case "judgeOpinionHistogram":
            const judgeOpinionData = data.map(item => parseInt(item.judge_opinion_length) || 0);
            const judgeBins = binData(judgeOpinionData, 50);
            chartInstance = new Chart(ctx, {
                type:"bar",
                data:{
                    labels : judgeBins.bins.map(bin => `${bin} - ${bin +50}`),
                    datasets:[{
                        label :"Judge Opinion Length",
                        data : judgeBins.binnedData,
                        backgroundColor :"rgba(255 ,99 ,132 ,0.5)",
                        borderColor :"rgba(255 ,99 ,132 ,1)",
                        borderWidth :1,
                    }],
                },
                options:{
                    responsive:true ,
                    scales:{
                        x:{title:{display:true,text:"Length of Judge Opinions"}},
                        y:{title:{display:true,text:"Frequency"}},
                    }
                }
            });
            break;

        case "binaryPieChart1":
            const binaryCounts1 = getBinaryCounts(test_data);
            chartInstance = new Chart(ctx, {
                type:"pie",
                data:{
                    labels:["Label 0","Label 1"],
                    datasets:[{
                        data:[binaryCounts1[0],binaryCounts1[1]],
                        backgroundColor:["#FF6384","#36A2EB"],
                    }],
                },
                options:{responsive:true ,maintainAspectRatio:true},
            });
            break;

        case "districtBinaryBarChart1":
            const districtBinaryCounts1 = getDistrictBinaryCounts(test_data);
            const districtLabels1 = Object.keys(districtBinaryCounts1);
            const district0Counts1 = districtLabels1.map(district => districtBinaryCounts1[district][0]);
            const district1Counts1 = districtLabels1.map(district => districtBinaryCounts1[district][1]);
            chartInstance = new Chart(ctx, {
                type:"bar",
                data:{
                    labels:districtLabels1,
                    datasets:[
                        {
                            label:"Label 0 Count",
                            data:district0Counts1,
                            backgroundColor:"rgba(255 ,99 ,132 ,0.5)",
                            borderColor:"rgba(255 ,99 ,132 ,1)",
                            borderWidth :1,
                        },
                        {
                            label:"Label 1 Count",
                            data:district1Counts1,
                            backgroundColor :"rgba(54 ,162 ,235 ,0.5)",
                            borderColor :"rgba(54 ,162 ,235 ,1)",
                            borderWidth :1,
                        },
                    ],
                },
                options:{
                    responsive:true ,
                    indexAxis:"y",
                    scales:{
                        x:{title:{display:true,text:"Count"}},
                        y:{title:{display:true,text:"Districts"}},
                    },
                },
            });
            break;

        case "binaryPieChart2":
            const binaryCounts2 = getBinaryCounts(train_data);
            chartInstance = new Chart(ctx,{
                type:'pie',
                data:{
                    labels:['Label 0','Label 1'],
                    datasets:[{
                        data:[binaryCounts2[0],binaryCounts2[1]],
                        backgroundColor:["#FF6384","#36A2EB"],
                    }],
                },
                options:{responsive:true ,maintainAspectRatio:true},
            });
            break;

        case "districtBinaryBarChart2":
            const districtBinaryCounts2 = getDistrictBinaryCounts(train_data);
            const districtLabels2 = Object.keys(districtBinaryCounts2);
            const district0Counts2 = districtLabels2.map(district => districtBinaryCounts2[district][0]);
            const district1Counts2 = districtLabels2.map(district => districtBinaryCounts2[district][1]);
            chartInstance = new Chart(ctx,{
                type:'bar',
                data:{
                    labels:districtLabels2,
                    datasets:[
                        {
                            label:"Label 0 Count",
                            data:district0Counts2,
                            backgroundColor :"rgba(255 ,99 ,132 ,0.5)",
                            borderColor :"rgba(255 ,99 ,132 ,1)",
                            borderWidth :1,
                        },
                        {
                            label:"Label 1 Count",
                            data:district1Counts2,
                            backgroundColor :"rgba(54 ,162 ,235 ,0.5)",
                            borderColor :"rgba(54 ,162 ,235 ,1)",
                            borderWidth :1,
                        },
                    ],
                },
                options:{
                    responsive:true ,
                    indexAxis:"y",
                    scales:{
                        x:{title:{display:true,text:"Count"}},
                        y:{title:{display:true,text:"Districts"}},
                    },
                },
            });
            break;
        
            case "epochLossChart":
                const epochsLoss = model_train.map(data => parseFloat(data.epoch));
                const losses = model_train.map(data => parseFloat(data.loss));
                
                chartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: epochsLoss,
                        datasets: [{
                            label: 'Loss',
                            data: losses,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            fill: true,
                        }]
                    },
                    options: {
                        scales: {
                            x: { title: { display: true, text: 'Epoch' } },
                            y: { title: { display:true,text:'Loss' } }
                        }
                    }
                });
                break;
    
            case "epochLearningRateChart":
                const epochsLearningRate = model_train.map(data => parseFloat(data.epoch));
                const learningRates = model_train.map(data => parseFloat(data.learning_rate));
                
                chartInstance = new Chart(ctx, {
                    type:'line',
                    data:{
                        labels : epochsLearningRate,
                        datasets:[{
                            label:'Learning Rate',
                            data : learningRates,
                            borderColor :'rgba(54,162,235,1)',
                            backgroundColor :'rgba(54,162,235,.5)',
                            fill:true
                         }]
                     },
                     options:{
                         scales:{
                             x:{title:{display:true,text:'Epoch'}},
                             y:{title:{display:true,text:'Learning Rate'}}
                         }
                     }
                 });
                 break;

        default:
            console.error('Invalid chart ID');
    }

    document.getElementById("modalOverlay").style.display = "flex";
    document.getElementById("inferenceText").textContent = inference;
}

// Function to close modal and clean up
function closeModal() {
   document.getElementById("modalOverlay").style.display="none";
   if (chartInstance) {
      chartInstance.destroy();
      chartInstance=null;
   }
}