import { setDate } from 'date-fns/esm';
import React, { useEffect, useState } from 'react';
//
import { Chart } from 'react-charts';
import PersonIcon from '@material-ui/icons/Person';
import Typography from '@material-ui/core/Typography';
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import { useNavigate } from "react-router-dom";
import { DateTimePicker, MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

export const Graph = () => {
  const [data, setData] = useState([
    {
      label: "Active Users",
      datums: [],
    }
  ])
  const [activeUsers, setActiveUsers] = useState(undefined);
  const [loading, setLoading] = useState(1)
  const [axes, setAxes] = useState([])
  const navigation = useNavigate();
  const [startDate, setStartDate] = useState(null);


  useEffect(() => {
    StatisticService.getActiveOnlineUsersCharts("2021-06-01T00:00:00.000")
        .then((res) =>{
            if (res.status === 200)
              return res.json();
        })
        .then((res) =>{
          console.log(res)
          setActiveUsers(res)
        })

    const datums = []
    if (active_users) {
      for (let i = 0; i < active_users.length; i++) {
        for (const [key, value] of Object.entries(active_users[i])) {
          //@ts-ignore
          let key_final = key.replace(" ", 'T')
          key_final = key_final.substring(0, key_final.length-3)
          key_final += 'Z'
          datums.push({x: new Date(key), y: value})
        }
      }

      setData([
        {
          label: "Active Users",
          datums: datums,
        }
      ])
      setAxes([{ primary: true, type: 'time', position: 'bottom' },{ type: 'linear', position: 'left' }])
      setLoading(0)
    }
  }, [active_users]);

  if (loading) {
    return (
      <div style={{width: '100%', textAlign: 'center'}}>
        <Typography variant="h6" component="h6" gutterBottom  style={{fontWeight: 600, color: 'white', margin: 'auto'}}>
          Loading...
        </Typography>
      </div>
    )
  }

  return (
    <>
    
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '12px',
          height: '100%',
          width: '100%',
          background: 'rgba(0, 27, 45, 0.9)'
        }}
      >
        <div
          style={{
            flex: '0 0 auto',
            padding: '10px',
          }}
        >
          <Typography variant="h6" component="h6" gutterBottom  style={{fontWeight: 600, color: 'white'}}>
            Active Online Users
          </Typography>
          <MuiPickersUtilsProvider  utils={DateFnsUtils}>
            <DateTimePicker label="Start Date" value={startDate} onChange={setStartDate} />
          </MuiPickersUtilsProvider>
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <DateTimePicker label="End Date" value={endDate} onChange={setEndDate} />
          </MuiPickersUtilsProvider>
        </div>
        <div
          style={{
            flex: 2,
            maxHeight: '400px',
          }}
        >
          <Chart
            data={data}
            series={{showPoints: false}}
            axes={axes}
            tooltip
            dark
            primaryCursor={{
              render: props => (
                <span style={{ fontSize: '1rem' }}>
                  <span role="img" aria-label="icon">
                    🕑
                  </span>{' '}
                  {(props.formattedValue || '').toString()}
                </span>
              )
            }}
            secondaryCursor={{
              render: props => (
                <span style={{ fontSize: '1rem' }}>
                  <span role="img" aria-label="icon">
                    <PersonIcon style={{fontWeight: 600, color: 'white'}}/>
                  </span>{' '}
                  {(props.formattedValue || '').toString()}
                </span>
              )
            }}/>
        </div>
        <div
          style={{
            flex: '0 0 auto',
            padding: '10px',
          }}
        >
          <Typography variant="h6" onClick={() => navigation('/admin/statistics')}  component="h6" gutterBottom 
            style={{cursor: 'pointer', fontWeight: 600, color: '#2b9bfd', float: 'right', paddingTop: 20, marginBottom: -25}}>
            <NavigateNextIcon /> Check Out More Statistics
          </Typography>
        </div>
      </div>
      <br />
    </>
  )
}