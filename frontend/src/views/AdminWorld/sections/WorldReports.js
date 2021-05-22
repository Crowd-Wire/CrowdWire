import React from 'react';
import WorldReportCard from './WorldReportCard.js';
import WorldService from '../../../services/WorldService.js';


export default function WorldReports(props) {

    const [page, setPage] = React.useState("1");
    const [reports, setReports] = React.useState([]);

    const request = (page) => {
        WorldService.getAllReports(page)
        .then((res) => {
            return res.json();
        })
        .then((res) =>{
            console.log(res);
            setReports(res);
        })
    }

    React.useEffect(() => {
        request(1);
    },[])

    return (
        <div>
            {reports.map((r, i) => {     
                return (<WorldReportCard key={i} report={r} reset={() => request(1)}/>)
            })}
            
        </div>
    )
}
