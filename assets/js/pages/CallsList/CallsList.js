import React, {useRef} from 'react';

import { DataTable } from 'primereact/datatable'
import {Column} from "primereact/column";
import moment from "moment";
import {Dropdown} from "primereact/dropdown";
import {Button} from "primereact/button";
import {CallDetail} from "./../../components/CallDetail/CallDetail"
import {format_minutes, statuses} from '../../lib/common'

import './CallsList.scss';
import {phoneTemplate,
    posTemplate,
    queuenameTemplate,
    timeTemplate,
    agentTemplate,
    callResultTemplate,
    calltimeTemplate,
    inputPhoneTemplate,
    waitTemplate} from "./CellTemplates";
import ConfigPanel from "./ConfigPanel";

export default function CallsList(props) {

    const [callList, setCallList] = React.useState([])
    const timer = useRef()

    const [agents,setAgents] = React.useState([]);

    const [selectedStatus,setSelectedStatus] = React.useState('')
    const [selectedAgent, setSelectedAgent] = React.useState('')

    // const [dt,setDt] = React.useState(null)
    const table = useRef()
    const [cols,setCols] = React.useState({
        isQueuename:localStorage.getItem('isQueuename') !== 'false',
        isPos:localStorage.getItem('isPos') !== 'false',
        isInputPhone:localStorage.getItem('isInputPhone') !== 'false'
    })

    const op = useRef()

    const [callDetail,setCalDetail] = React.useState(false)
    const [selectedCall,setSelectedCall] = React.useState(null)

    const getCallsList = () => {
        let s_date = moment(props.date).format("YYYY-MM-DD");
        console.log(s_date)
        fetch(`/api/calls_list/${s_date}`).then(response => response.json()).then(result=>setCallList(result))
    }

    React.useEffect(()=>{
        setCallList([])
        let s_date = moment(props.date).format("YYYY-MM-DD");
        let c_date = moment().format("YYYY-MM-DD");
        (s_date===c_date) ?
            timer.current = setInterval(getCallsList,120000)
         :  clearInterval(timer.current)

        getCallsList()

        fetch("/api/agents").then(response=>response.json()).then(result=>setAgents(result));

        return (
            ()=>{
                clearInterval(timer.current)
            }
        )
    },[props.date])

    React.useEffect(()=>{
        console.log('Выбранные агент :',selectedAgent)
        if(table)
            table.current.filter(selectedAgent,'agent','equals')
    },[selectedAgent])

    React.useEffect(()=>{
        if(table)
            table.current.filter(selectedStatus,'d_type','equals')
    },[selectedStatus])

    const rowClicked = (e) => {
        console.log(e)
        setCalDetail(true)
        setSelectedCall(e.data.callid)
    }

    const resultFilter = <Dropdown value={selectedStatus} options={statuses} onChange={e => setSelectedStatus(e.value)} className="p-column-filter" showClear />
    const agentFilter =  <Dropdown value={selectedAgent} options={agents} onChange={e => setSelectedAgent(e.value)} placeholder={'по оператору'} showClear className={"p-column-filter"} autoWidth />

    const exportData=()=>{
        table.current.exportCSV()
    }

    const header = <div className={"CallList-header"}>
                    <h1 style={{marginTop: '8px', marginBottom: '8px'}}>Список звонков</h1>
                    <div className={"CallLits-header-buttons"}>
                        <Button type={"button"} icon={"pi pi-save"} label={"Экспорт"} onClick={exportData} />
                        <Button type="button" icon="pi pi-cog" label="Опции" onClick={(e)=>op.current.toggle(e)} />
                   </div>
                  </div>;

    const handleColumnConfig=(e)=>{
        const {name,checked} = e.target
        const param = {...cols}
        switch (name){
            case 'isQueuename' :
                param.isQueuename = checked
                break
            case 'isPos' :
                param.isPos = checked
                break
            case 'isInputPhone' :
                param.isInputPhone = checked
                break
        }
        setCols(param)
        localStorage.setItem(name,checked)
    }

    return (
        <div className={"CallsList-resp"}>

            <ConfigPanel ref={op} cols={cols} handler={handleColumnConfig} />

            <CallDetail showed={callDetail} setShowed={setCalDetail} call={selectedCall} />

            <DataTable value={callList}
                       ref={table}
                       selectionMode="single"
                       onRowClick={e => rowClicked(e)}
                       dataKey={'callid'}
                       // scrollable scrollHeight="80vh"
                       className="CallsList-table"
                       paginator rows={10}
                       removableSort
                       // resizableColumns
                       // columnResizeMode="fit"
                       paginatorRight
                       paginatorTemplate = "FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                       currentPageReportTemplate="Показано записей от {first} до {last} из {totalRecords} "
                       rowsPerPageOptions={[10,25,50]}
                       sortMode="multiple"
                       loading={callList.length===0}
                       header={header}
            >
                <Column field={'time'} header={'Время'} body={timeTemplate}  sortable />
                <Column field={'phone'} header={'Телефон'} body={phoneTemplate} filter filterPlaceholder="по номеру" />
                {
                   cols.isQueuename && (<Column field={'queuename'} header={'Очередь'} body={queuenameTemplate} /*style={{width:'120px'}} */ />)
                }
                { cols.isPos && (<Column field={'pos'} header={'Позиция'} body={posTemplate} sortable /*style={{width:'130px'}} */ />)}
                { cols.isInputPhone && (<Column field={'input_phone'} body={inputPhoneTemplate} header={'Входной номер'} />)}
                <Column field={'agent'} header={'Оператор'} body={agentTemplate} filter filterElement={agentFilter} />
                {/*<Column field={'notanswer_num'} header={'P'} body={notAnswerTemplate}   />*/}
                <Column field={'wait'} header={'Ожидание'} body={waitTemplate} sortable /*style={{width:'144px'}}*/ />
                <Column field={'calltime'} header={'Разговор'} body={calltimeTemplate} sortable /*style={{width:'144px'}}*/  />
                <Column field={'d_type'} header={'Статус звонка'} body={callResultTemplate}
                        sortable
                        filter
                        filterElement={resultFilter}
                />
            </DataTable>

        </div>
    )
}