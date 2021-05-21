import React from 'react';
import WorldReports from './sections/WorldReports.js';
import WorldService from '../../services/WorldService.js';

export default function AdminWorld() {

    const [page, setPage] = React.useState("1");
    const [reports, setReports] = React.useState([]);

    React.useEffect(() => {
        WorldService.get_all_reports(page)
        .then((res) => {
            return res.json();
        })
        .then((res) =>{
            console.log(res);
            setReports(res);
        })

    },[])


    return (
        <div>
            <WorldReports reports={reports} />
        </div>
    )
}
