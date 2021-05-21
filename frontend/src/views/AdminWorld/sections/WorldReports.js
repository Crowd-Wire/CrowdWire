import React from 'react';
import WorldReportCard from './WorldReportCard.js';

export default function WorldReports(props) {


    return (
        <div>
            <WorldReportCard report={props.reports[0]}/>
        </div>
    )
}
