import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import headerPic from '../assets/headerpic.png';
import * as XLSX from 'xlsx'; // Import xlsx for Excel generation
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { BiError } from "react-icons/bi";


const Dashboard = () => {
    const [auth, setAuth] = useState(false);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const [data, setData] = useState([]);
    const pieChartRef = useRef(null);
    const lineChartRef = useRef(null);
    const pieChart = useRef(null);
    const lineChart = useRef(null);
    const divRef = useRef(null);
    const [includeHeader, setIncludeHeader] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [selectedDate, setSelectedDate] = useState('');


    useEffect(() => {
        axios.get('http://localhost:5000/dashboard')
            .then(res => {
                if (res.data.Status === "Success") {
                    setAuth(true);
                    setName(res.data.name);
                } else {
                    setMessage(res.data.Message);
                }
            });
    }, []);

    const fetchData = async (year, month, day) => {
        try {
            const response = await axios.get('http://localhost:5000/logs', {
                params: {
                    year: year,
                    month: month,
                    day: day
                }
            });
            setData(response.data);
            console.log(response);
        } catch (error) {
            console.error('Axios error:', error);
        }
    };

    useEffect(() => {
        if (data.length > 0) {
            renderCharts();
        }
    }, [data]);

    const renderCharts = () => {
        if (pieChartRef.current && lineChartRef.current) {
            pieChartRef.current.width = 100;
            pieChartRef.current.height = 100;
            lineChartRef.current.width = 100;
            lineChartRef.current.height = 100;

            renderPieChart();
            renderLineChart();
        }
    };

    const renderPieChart = () => {
        const ctx = pieChartRef.current.getContext('2d');

        if (pieChart.currentChartInstance) {
            pieChart.currentChartInstance.destroy();
        }

        const programCounts = data.reduce((counts, { department }) => {
            counts[department] = (counts[department] || 0) + 1;
            return counts;
        }, {});

        const colorMapping = {
            "CAS": "pink",
            "CCS": "yellow",
            "CHS": "purple",
            "CEA": "gray",
            "CTDE": "blue",
            "CTHBM": "green"
        };

        const labels = Object.keys(programCounts);
        const dataPoints = labels.map(label => programCounts[label]);
        const backgroundColor = labels.map(label => colorMapping[label] || "#808080");

        pieChart.currentChartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: dataPoints,
                    backgroundColor: backgroundColor
                }]
            },
            options: {
                plugins: {
                    datalabels: {
                        formatter: (value, ctx) => {
                            let sum = 0;
                            let dataArr = ctx.chart.data.datasets[0].data;
                            dataArr.forEach(data => {
                                sum += data;
                            });
                            let percentage = (value * 100 / sum).toFixed(2) + "%";
                            return percentage;
                        },
                        color: 'black'
                    },
                    legend: {
                        position: 'right',
                        labels: {
                            usePointStyle: true
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    };

    const generateTimeSlots = () => {
        const timeSlots = [];
        for (let hour = 7; hour <= 18; hour++) {
            if (hour < 12) {
                timeSlots.push(`${hour}am`);
            } else if (hour === 12) {
                timeSlots.push(`${hour}pm`);
            } else {
                timeSlots.push(`${hour - 12}pm`);
            }
        }
        return timeSlots;
    };

    const generateDepartmentHourCounts = () => {
        const departmentHourCounts = {};
        data.forEach(user => {
            const { department, time_in } = user;
            const hour24 = parseInt(time_in.split(':')[0]);
            const hour12 = (hour24 % 12) || 12;
            const ampm = hour24 < 12 ? 'am' : 'pm';
            const hour12Str = `${hour12}${ampm}`;
            if (!departmentHourCounts[department]) {
                departmentHourCounts[department] = {};
            }
            if (!departmentHourCounts[department][hour12Str]) {
                departmentHourCounts[department][hour12Str] = 0;
            }
            departmentHourCounts[department][hour12Str]++;
        });
        return departmentHourCounts;
    };

    const [departmentHourCounts, setDepartmentHourCounts] = useState({});

    useEffect(() => {
        const counts = generateDepartmentHourCounts();
        setDepartmentHourCounts(counts);
    }, [data]);

    const renderLineChart = () => {
        const ctx = lineChartRef.current.getContext('2d');

        if (lineChart.currentChartInstance) {
            lineChart.currentChartInstance.destroy();
        }

        const labels = generateTimeSlots();

        const hourCounts = {};
        labels.forEach(label => {
            hourCounts[label] = 0;
        });

        data.forEach(({ time_in }) => {
            const hour24 = parseInt(time_in.split(':')[0]);
            const hour12 = (hour24 % 12) || 12;
            const ampm = hour24 < 12 ? 'am' : 'pm';
            const hour12Str = `${hour12}${ampm}`;
            if (hour24 >= 7 && hour24 <= 18) {
                hourCounts[hour12Str]++;
            }
        });

        const dataPoints = labels.map(label => hourCounts[label]);

        const options = {
            scales: {
                y: {
                    beginAtZero: true
                },
                x: {
                    display: true,
                    title: {
                        display: true,
                    }
                }
            },
            plugins: {
                datalabels: {
                    formatter: (value, context) => {
                        return context.dataset.data[context.dataIndex];
                    },
                    color: '#fff',
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    borderRadius: 4,
                    align: 'end',
                    anchor: 'end',
                    offset: 4
                }
            }
        };

        lineChart.currentChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Students',
                    data: dataPoints,
                    borderColor: 'blue',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: options
        });
    };

    const generatePDF = () => {
        setIsDownloading(true);

        const div = divRef.current;

        // Load the header image
        const headerImage = new Image();
        headerImage.src = headerPic;

        headerImage.onload = () => {
            html2canvas(div).then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('landscape', 'mm', [216, 356]); // 8.5 x 14 inches in mm

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                // Calculate the dimensions for the content image
                const canvasAspectRatio = canvas.width / canvas.height;
                const pdfAspectRatio = pdfWidth / pdfHeight;

                let contentImgWidth, contentImgHeight;
                if (canvasAspectRatio > pdfAspectRatio) {
                    // Fit width
                    contentImgWidth = pdfWidth;
                    contentImgHeight = pdfWidth / canvasAspectRatio;
                } else {
                    // Fit height
                    contentImgHeight = pdfHeight;
                    contentImgWidth = pdfHeight * canvasAspectRatio;
                }

                // Calculate the dimensions for the header image
                const headerAspectRatio = headerImage.width / headerImage.height;
                const headerContainerWidth = pdfWidth; // Width of the container
                const headerContainerHeight = headerContainerWidth / headerAspectRatio; // Height of the container based on aspect ratio

                // Position the content exactly below the header image
                const contentYPosition = headerContainerHeight;

                pdf.addImage(headerImage, 'PNG', 0, 0, headerContainerWidth, headerContainerHeight); // Set y to 0 to place at the top
                pdf.addImage(imgData, 'PNG', (pdfWidth - contentImgWidth) / 2, contentYPosition, contentImgWidth, contentImgHeight);
                pdf.save('library_statistics.pdf');

                setIsDownloading(false);
            });
        };
    };



    const getUserCountByTimeSlot = (department, timeSlot) => {
        if (departmentHourCounts[department] && departmentHourCounts[department][timeSlot]) {
            return departmentHourCounts[department][timeSlot];
        }
        return 0;
    };

    const getTotalForTimeSlot = (timeSlot) => {
        let total = 0;
        Object.keys(departmentHourCounts).forEach((department) => {
            if (departmentHourCounts[department][timeSlot]) {
                total += departmentHourCounts[department][timeSlot];
            }
        });
        return total;
    };

    const getGrandTotal = () => {
        let grandTotal = 0;
        Object.keys(departmentHourCounts).forEach((department) => {
            Object.keys(departmentHourCounts[department]).forEach((timeSlot) => {
                grandTotal += departmentHourCounts[department][timeSlot];
            });
        });
        return grandTotal;
    };

    const generateYearOptions = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = currentYear; year >= 1900; year--) {
            years.push(year);
        }
        return years;
    };

    const generateMonthOptions = () => {
        return [
            { value: '01', name: 'January' },
            { value: '02', name: 'February' },
            { value: '03', name: 'March' },
            { value: '04', name: 'April' },
            { value: '05', name: 'May' },
            { value: '06', name: 'June' },
            { value: '07', name: 'July' },
            { value: '08', name: 'August' },
            { value: '09', name: 'September' },
            { value: '10', name: 'October' },
            { value: '11', name: 'November' },
            { value: '12', name: 'December' }
        ];
    };

    const generateDayOptions = () => {
        const days = [];
        for (let day = 1; day <= 31; day++) {
            days.push(day.toString().padStart(2, '0'));
        }
        return days;
    };

    const handleYearChange = (e) => setYear(e.target.value);
    const handleMonthChange = (e) => setMonth(e.target.value);
    const handleDayChange = (e) => setDay(e.target.value);

    const handleSetClick = () => {
        if (year && month) {
            fetchData(year, month, day);
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const selectedMonth = monthNames[parseInt(month) - 1];
            const dateString = day ? `${selectedMonth} ${day}, ${year}` : `${selectedMonth} ${year}`;
            setSelectedDate(dateString);
        } else {
            alert('Please select a year and month.');
        }
    };


    const generateInterpretation = () => {
        if (data.length === 0) {
            return <p>No data available to generate interpretation.</p>;
        }

        // Find the department with the highest count
        const programCounts = data.reduce((counts, { department }) => {
            counts[department] = (counts[department] || 0) + 1;
            return counts;
        }, {});

        const highestDepartment = Object.keys(programCounts).reduce((a, b) => programCounts[a] > programCounts[b] ? a : b);
        const highestCount = programCounts[highestDepartment];
        const totalUsers = data.length;
        const highestPercentage = ((highestCount / totalUsers) * 100).toFixed(2);

        // Find the peak hour
        const timeSlotCounts = data.reduce((counts, { time_in }) => {
            const hour24 = parseInt(time_in.split(':')[0]);
            const hour12 = (hour24 % 12) || 12;
            const ampm = hour24 < 12 ? 'am' : 'pm';
            const hour12Str = `${hour12}${ampm}`;
            counts[hour12Str] = (counts[hour12Str] || 0) + 1;
            return counts;
        }, {});

        const peakHour = Object.keys(timeSlotCounts).reduce((a, b) => timeSlotCounts[a] > timeSlotCounts[b] ? a : b);
        const peakCount = timeSlotCounts[peakHour];
        const peakPercentage = ((peakCount / totalUsers) * 100).toFixed(2);

        return (
            <div>
                Based on the pie graph presented, the <strong>{highestDepartment}</strong> has the highest percentage of users, which is <strong>{highestCount}</strong> or <strong>{highestPercentage}%</strong> of the total library users. Including all six colleges and the graduate school, with a total of <strong>{totalUsers}</strong> or <strong>{((totalUsers / 13815) * 100).toFixed(2)}%</strong> of the 13,815 user population accommodated in the library this April 29, 2024.
                Based on the line graph presented, it shows that <strong>{peakPercentage}%</strong> or <strong>{peakCount}</strong> out of <strong>{totalUsers}</strong> users entered at <strong>{peakHour}</strong>, which is considered the peak hour of the library.
            </div>
        );
    };

    return (
        <>
            {auth ? (
                <>
                    <Navbar />
                    <Sidebar />
                    <div className="ml-64 pt-16 mb-10 ">
                        <div className='w-auto h-10 bg-gray-700 items-center -mt-3 justify-center flex'>
                            <select value={year} onChange={handleYearChange}>
                                <option value="">Year</option>
                                {generateYearOptions().map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                            <select value={month} onChange={handleMonthChange}>
                                <option value="">Month</option>
                                {generateMonthOptions().map(({ value, name }) => (
                                    <option key={value} value={value}>{name}</option>
                                ))}
                            </select>
                            <select value={day} onChange={handleDayChange}>
                                <option value="">Day</option>
                                {generateDayOptions().map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                            <button className='m-2 py-1 px-4 bg-blue-700 text-md text-white font-mono rounded-md hover:bg-white hover:text-black' onClick={handleSetClick}>Set</button>


                            <button className='m-2 py-1 px-4 bg-blue-700 text-md text-white font-mono rounded-md hover:bg-white hover:text-black' onClick={generatePDF} disabled={isDownloading}>Download PDF</button>


                        </div>


                        <div ref={divRef}>

                            <div className='p-4'>
                                <h1 className='font-mono font-semibold text-2xl'>STATISTICS OF LIBRARY USERS</h1>
                                <h1 className='font-mono font-semibold text-lg'>{selectedDate}</h1>
                            </div>
                            {selectedDate && (
                                <div className='m-2 -mt-20 lg:-mt-4'>
                                    <div className='grid grid-cols-1 md:grid-cols-2 justify-center items-center gap-4'>
                                        {/* piechart */}
                                        <div className='m-auto w-3/4 lg:w-7/12'>
                                            <div className=''>
                                                <canvas ref={pieChartRef}></canvas>
                                            </div>
                                        </div>

                                        {/* linechart */}
                                        <div className='m-auto w-10/12 lg:w-7/12'>
                                            <div className='w-auto'>
                                                <canvas ref={lineChartRef}></canvas>
                                            </div>
                                        </div>

                                    </div>
                                    <div className='grid grid-cols-2 justify-center -mt-4 gap-8'>
                                        <div className=''>
                                            <table className='text-sm border-2 m-auto border-black' style={{ borderCollapse: 'collapse' }}>
                                                <thead>
                                                    <tr>
                                                        <th className='font-semibold text-lg bg-slate-400 border-b-black border-2 border-black' colSpan={generateTimeSlots().length + 2}>LIBRARY HOURS</th>
                                                    </tr>
                                                    <tr>
                                                        <th className='border-2 border-black'>College</th>
                                                        {generateTimeSlots().map((time, index) => (
                                                            <th className='border-2 border-black' key={index}>{time}</th>
                                                        ))}
                                                        <th className='border-2 border-black'>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.keys(departmentHourCounts).map((department, deptIndex) => (
                                                        <tr key={deptIndex}>
                                                            <td className='border-2 border-black'>{department}</td>
                                                            {generateTimeSlots().map((timeSlot, timeIndex) => (
                                                                <td className='border-2 border-black' key={timeIndex}>{getUserCountByTimeSlot(department, timeSlot)}</td>
                                                            ))}
                                                            <td className='border-2 border-black bg-gray-400'>{Object.values(departmentHourCounts[department]).reduce((total, count) => total + count, 0)}</td>
                                                        </tr>
                                                    ))}
                                                    {Object.keys(departmentHourCounts).map((department, deptIndex) => (
                                                        data.find((user) => user.department === department) ? null : (
                                                            <tr key={`no-record-${deptIndex}`}>
                                                                <td className='border-2 border-black'>{department}</td>
                                                                <td className='border-2 border-black' colSpan={generateTimeSlots().length}>0</td>
                                                                <td className='border-2 border-black'>0</td>
                                                            </tr>
                                                        )
                                                    ))}
                                                    <tr className='border-2 border-black'>
                                                        <td className='border-2 border-black'>Total</td>
                                                        {generateTimeSlots().map((timeSlot, timeIndex) => (
                                                            <td className='border-2 border-black bg-gray-400' key={timeIndex}>{getTotalForTimeSlot(timeSlot)}</td>
                                                        ))}
                                                        <td className='border-2 border-black bg-gray-400'>{getGrandTotal()}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>



                                        <div className="border-2 border-black text-sm w-auto">
                                            <h1 className="font-semibold text-sm bg-slate-400 border-2 border-b-black">INTERPRETATION</h1>
                                            <p className="text-sm">{generateInterpretation()}</p>
                                        </div>


                                    </div>

                                    <div className='grid grid-cols-2 gap-4 justify-center mt-11'>
                                        <div className=''>
                                            <h1 className=' text-left '>Prepared by:</h1>
                                            <input type="text" name="" id="" className='font-semibold text-md -pb-3 text-center' />
                                            <p className='font-semibold text-sm'>Circulations Librarian</p>
                                        </div>
                                        <div className=''>
                                            <h1 className=' text-left'>Noted by:</h1>
                                            <input type="text" name="" id="" className='font-semibold text-md -pb-3 text-center' />
                                            <p className='font-semibold text-sm'>Director, LRDS</p>
                                        </div>
                                    </div>


                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className='flex items-center justify-center mt-64'>
                    <div>
                    <h6>{message}</h6>

                    <div className='flex items-center justify-center'>
                     <BiError  className='text-9xl text-red-600'/>
                    </div>
                    <h6 className='text-6xl mb-3 font-mono'>401</h6>
                    <h6 className='text-2xl mb-3 font-mono'>You are not authorized!</h6>
                    <Link to="/login" className='bg-blue-700 mt-10 px-9 py-1 rounded-full text-white  text-lg font-mono'>Login</Link>
                    </div>
                </div>
            )}
        </>
    );
};

export default Dashboard;
