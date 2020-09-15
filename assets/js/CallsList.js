import React from 'react';

import { DataTable } from 'primereact/datatable'
import {Column} from "primereact/column";
import moment from "moment";
import {Dropdown} from "primereact/dropdown";

import {format_minutes} from './lib/common'

export default function CallsList(props) {

    const [callList, setCallList] = React.useState([])
    const [timer,setTimer] = React.useState(null)

    const [selectedStatus,setSelectedStatus] = React.useState('')
    const statuses = [
        'Оператор положил трубку',
        'Абонент положил трубку',
        'Пропушеный вызов'
    ]

    const getCallsList = () => {
        let s_date = moment(props.date).format("YYYY-MM-DD");
        console.log(s_date)
        fetch(`/api/calls_list/${s_date}`).then(response => response.json()).then(result=>setCallList(result))
    }

    React.useEffect(()=>{
        let s_date = moment(props.date).format("YYYY-MM-DD");
        let c_date = moment().format("YYYY-MM-DD");
        (s_date===c_date) ?
            setTimer(setInterval(getCallsList,120000))
         :  clearInterval(timer)

        getCallsList()
    },[props.date])

    const rowClicked = (e) => {
        console.log(e)
    }

    // const statusFilter = <Dropdown value={this.state.selectedStatus} options={this.statuses} onChange={(e) => this.setState({ selectedStatus: e.value })} itemTemplate={this.statusItemTemplate} placeholder="Select a Status" className="p-column-filter" showClear />;


    const resultFilter = <Dropdown value={selectedStatus} options={statuses} onChange={e => setSelectedStatus(e.value)} className="p-column-filter" />

    const waitTemplate=(data)=>{
        return (
            <>
                <span>{format_minutes(data.wait)} </span>
            </>
        )
    }

    const calltimeTemplate=(data)=>{
        return (
            <>
                <span>{format_minutes(data.calltime)}</span>
            </>
        )
    }

    const timeTemplate=(data)=>{
        return (
            <>
                <span>{data.time.slice(11)}</span>
            </>
        )
    }

    return (
        <>
            <h1>Список звонков</h1>
            <DataTable value={callList}
                       selectionMode="single"
                       onRowClick={e => rowClicked(e)}
                       dataKey={'callid'}
                       scrollable scrollHeight="80vh"
                       className="p-datatable-striped"
                       removableSort
                       resizableColumns
                       columnResizeMode="fit"
            >
                <Column field={'time'} header={'Время'} body={timeTemplate}  sortable />
                <Column field={'phone'} header={'Телефон'} filter filterPlaceholder="по номеру" />
                <Column field={'queuename'} header={'Очередь'} />
                <Column field={'pos'} header={'Позиция'} sortable />
                <Column field={'input_phone'} header={'Входной номер'} />
                <Column field={'agent'} header={'Оператор'} />
                <Column field={'wait'} header={'Ожидание'} body={waitTemplate} sortable />
                <Column field={'calltime'} header={'Разговор'} body={calltimeTemplate} sortable />
                <Column field={'d_type'} header={'Результат звонка'}
                        sortable
                        // filter
                        // filterElement={resultFilter}
                />
            </DataTable>

        </>
    )
}