import React, { useState } from 'react';
import './datepicker.css';


const DatePicker = () => {
  let oneDay = 60 * 60 * 24 * 1000;
  let todayTimestamp = Date.now() - (Date.now() % oneDay) + (new Date().getTimezoneOffset() * 1000 * 60);
  let inputRef = React.createRef();
  
  const daysArray = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
  const monthArray = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const [showDatePicker, setShowDatePicker] = useState(false)
  
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth();

  console.log(month)
  
  const getNumberOfDays = (year, month) => {
    return 40 - new Date(year, month, 40).getDate();
  }

  const getDayDetails = (payload) => {
    let date = payload.index - payload.firstDay;
    let day = payload.index % 7;
    let prevMonth = payload.month - 1;
    let prevYear = payload.year;
    
    if(prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }

    let prevMonthNumberOfDays = getNumberOfDays(prevYear, prevMonth);
    let _date = (date < 0 ? prevMonthNumberOfDays + date : date % payload.numberOfDays) + 1;
    let month = date < 0 ? -1 : date >= payload.numberOfDays ? 1 : 0;
    let timestamp = new Date(payload.year, payload.month, _date).getTime();
  
    return {
      date: _date,
      day,
      month,
      timestamp,
      dayString: daysArray[day]
    }
  }

  const getMonthDetails = (year, month) => {
    let firstDay = (new Date(year, month)).getDay();
    let numberOfDays = getNumberOfDays(year, month);
    let monthArray = [];
    let rows = 6;
    let currentDay = null;
    let index = 0;
    let cols = 7;

    for(let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        currentDay = getDayDetails({
          index,
          numberOfDays,
          firstDay,
          year,
          month
        });
        
        monthArray.push(currentDay);
        index++
      }
    }
    return monthArray;
  }
  
  const [pickerDate, setPickerDate] = useState({
    year,
    month,
    selectedDay: todayTimestamp,
    monthDetails: getMonthDetails(year, month)
  })

  const isCurrentDay = (day) => {
    return day.timestamp === todayTimestamp
  }

  const isSelectedDay = (day) => {
    return day.timestamp === pickerDate.selectedDay;
  }

  const getDateFromDateString = (payload) => {
    let value = payload.split('-').map((d) => parseInt(d, 10));
    if(value.length < 3) return null

    let year = value[0];
    let month = value[1];
    let date = value[2];
    return { year, month, date }
  }

  const getMonthStr = (month) => {
   return monthArray[Math.max(Math.min(11, month), 0)] || 'Month';
  }

  const getDateStringFromTimestamp = (timestamp) => {
    let dateObject = new Date(timestamp);
    let month = dateObject.getMonth() + 1;
    let date = dateObject.getDate();
    return dateObject.getFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (date < 10 ? '0' + date : date );
  }

  const setDate = (date) => {
    let selectedDay = new Date(date.year, date.month -1, date.date).getTime();
    setPickerDate({ selectedDay })
  }

  const updateDateFromInput = () => {
    let dateValue = inputRef.current.value;
    let datePayload = getDateFromDateString(dateValue);
    if(datePayload !== null) {
      setDate(datePayload)
      setPickerDate({
        year: datePayload.year,
        month: datePayload.month - 1,
        monthDetails: getMonthDetails(datePayload.year, datePayload.month - 1)
      })
    }
  }

  const setDateToInput = (timestamp) => {
    let dateString = getDateStringFromTimestamp(timestamp)
    inputRef.current.value = dateString;
  }

  const onDateClick = (day) => {
    let year = pickerDate.year
    let month = pickerDate.month;
    let selectedDay = day.timestamp
    setPickerDate({ selectedDay, year, month, monthDetails: getMonthDetails(year, month) })
    setDateToInput(day.timestamp)
  }

  const setYear = (offset) => {
    let year = pickerDate.year + offset
    let month = pickerDate.month;

    setPickerDate({
      year,
      month,
      monthDetails: getMonthDetails(year, month)
    })
  }

  const setMonth = (offset) => {
    let year = pickerDate.year;
    let month = pickerDate.month + offset;
    if(month === -1) {
      month = 11;
      year--;
    } else if (month === 12) {
      month = 0;
      year++;
    }

    setPickerDate({
      year,
      month,
      monthDetails: getMonthDetails(year, month)
    })
  }
  
  const renderCalendar = () => {
    let days = pickerDate.monthDetails.map((day, index)=> {
        return (
            <div className={'c-day-container ' + (day.month !== 0 ? ' disabled' : '') + 
                (isCurrentDay(day) ? ' highlight' : '') + (isSelectedDay(day) ? ' highlight-green' : '')} key={index}>
                <div className='cdc-day'>
                    <span onClick={() => onDateClick(day)}>
                        {day.date || ''}
                    </span>
                </div>
            </div>
        )
    })

    return (
        <div className='c-container'>
            <div className='cc-head'>
                {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map((d,i)=><div key={i} className='cch-name'>{d}</div>)}
            </div>
            <div className='cc-body'>
                {days}
            </div>
        </div>
    )
}

  return (
    <div className='date-picker'>
      <div className='mdp-input' onClick={() => setShowDatePicker(true)}>
        <input type="date" onChange={updateDateFromInput} ref={inputRef} />
      </div>
      {showDatePicker && (
         <div className='mdp-container'>
         <div className='mdpc-head'>
             <div className='mdpch-button'>
                 <div className='mdpchb-inner' onClick={() => setYear(-1)}>
                     <span className='mdpchbi-left-arrows' />
                 </div>
             </div>
             <div className='mdpch-button'>
                 <div className='mdpchb-inner' onClick={() => setMonth(-1)}>
                     <span className='mdpchbi-left-arrow' />
                 </div>
             </div>
             <div className='mdpch-container'>
                 <div className='mdpchc-year'>{pickerDate.year}</div>
                 <div className='mdpchc-month'>{getMonthStr(pickerDate.month)}</div>
             </div>
             <div className='mdpch-button'>
                 <div className='mdpchb-inner' onClick={() => setMonth(1)}>
                     <span className='mdpchbi-right-arrow' />
                 </div>
             </div>
             <div className='mdpch-button' onClick={() => setYear(1)}>
                 <div className='mdpchb-inner'>
                     <span className='mdpchbi-right-arrows' />
                 </div>
             </div>
         </div>
         <div className='mdpc-body'>
             {renderCalendar()}
         </div>
     </div>
      )}
    </div>
  )
}

export default DatePicker;