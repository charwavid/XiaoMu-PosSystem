import React, { useState, useEffect } from "react";
import styled from "../../../../styles/vip.scss";
import { VipFn } from "./VipFn";
import { VipList } from "./VipList";
import { useAjax } from "../../../AjaxProvider";
import { VipManage } from "../../../../tasks/vip";
import { getFormatTime } from "../../../../tools/time";
import { useMemo } from "react";
import { Modal, message } from "antd";
import { VipForm } from "./VipForm";

export function Vip() {

    const ajax = useAjax();

    const [drawerData, setDrawerData] = useState({
        drawerType: "add",
        drawerStatus: false
    });

    const { drawerType, drawerStatus } = drawerData;

    function closeDrawer() {
        setDrawerData(s => ({
            ...s,
            drawerStatus: false
        }));
    }

    function showAddDrawer() {
        setDrawerData(s => ({
            ...s,
            drawerType: "add",
            drawerStatus: true
        }));
    }

    function showEditDrawer() {
        setDrawerData(s => ({
            ...s,
            drawerType: "edit",
            drawerStatus: true
        }));
    }

    const [vipData, setVipData] = useState({
        selectId: -1,
        selectType: "origin",
        vipList: []
    });


    function addVip(vip) {
        setVipData(s => ({
            ...s,
            selectId: vip.id,
            selectType: "origin",
            vipList: [...s.vipList, vip]
        }));
    }

    const { selectId, selectType } = vipData;
    const vipList = useMemo(() => (
        vipData.vipList.map(i => ({
            ...i,
            create_date: getFormatTime(i.create_date),
            change_date: getFormatTime(i.change_date)
        }))
    ), [vipData.vipList]);

    const selectItem = vipList.find(i => i.id === selectId);

    async function getVipList() {
        try {
            const { data } = await VipManage.getAllVip(ajax);
            let value = {
                selectType: "origin",
                vipList: data
            };

            if (data.length !== 0) {
                value.selectId = data[0].id;
            }

            setVipData(s => ({
                ...s,
                ...value
            }));
        } catch (error) {
            console.log(error);
        }
    }


    function handleEnableVip() {
        if (selectId === -1) return;
        const { code } = selectItem;

        async function enable() {
            try {
                await VipManage.enableVipMember(ajax, code);

                setVipData(s => ({
                    ...s,
                    vipList: s.vipList.map(i => {
                        if (i.id === selectId) {
                            return {
                                ...i,
                                is_disable: false
                            };
                        }
                        return i;
                    })
                }));
                message.success(`?????????${code}????????????!`);
            } catch (error) {
                console.log(error);
            }
        }

        Modal.confirm({
            title: `????????????????????????${code}????`,
            onOk: enable,
            okText: "??????",
            okType: "danger"
        });
    }

    function updateVip(code, value) {
        const vipList = vipData.vipList.map(i => {
            if (i.code === code) {
                return Object.assign({}, i, value);
            }

            return i;
        });

        setVipData(s => ({
            ...s,
            vipList
        }));
    }

    function handleDisableVip() {
        if (selectId === -1) return;
        const { code } = selectItem;

        async function dis() {
            try {
                await VipManage.disableVipMember(ajax, code);

                setVipData(s => ({
                    ...s,
                    vipList: s.vipList.map(i => {
                        if (i.id === selectId) {
                            return {
                                ...i,
                                is_disable: true
                            };
                        }
                        return i;
                    })
                }));
                message.success(`?????????${code}????????????!`);
            } catch (error) {
                console.log(error);
            }
        }

        Modal.confirm({
            title: `????????????????????????${code}????`,
            onOk: dis,
            okText: "??????",
            okType: "danger"
        })
    }

    function handleDelVip() {
        if (selectId === -1) return;
        const { code } = vipList.find(i => i.id === selectId);

        async function del() {
            try {
                await VipManage.delVipMember(ajax, code);

                const { vipList } = vipData;

                const index = vipList.findIndex(i => i.id === selectId);

                const item = vipList[index + 1] || vipList[index - 1];

                const nextSelectId = item && item.id || -1;

                setVipData(s => ({
                    ...s,
                    selectId: nextSelectId,
                    selectType: "origin",
                    vipList: s.vipList.filter(i => i.id !== selectId)
                }));
                message.success(`?????????${code}????????????!`);
            } catch (error) {
                console.log(error);
            }
        }

        Modal.confirm({
            title: `????????????????????????${code}????`,
            onOk: del,
            okText: "??????",
            okType: "danger"
        });
    }

    useEffect(() => {
        getVipList();
    }, []);

    function handleClickSelect(selectId, selectType = "click") {
        setVipData(s => ({
            ...s,
            selectId,
            selectType
        }));
    }

    return (
        <div className={styled["vip-wrapper"]}>
            <VipFn
                selectId={selectId}
                list={vipList}
                ajax={ajax}
                showDrawer={showAddDrawer}
                selectItem={selectItem}
                handleSelect={handleClickSelect}
                handleDel={handleDelVip}
                handleDisable={handleDisableVip}
                handleEnable={handleEnableVip}
                handleEditVip={showEditDrawer}
            />
            <VipList
                list={vipList}
                selectId={selectId}
                selectType={selectType}
                handleSelect={handleClickSelect}
            />
            <VipForm
                selectItem={selectItem}
                status={drawerStatus}
                closeDrawer={closeDrawer}
                addVip={addVip}
                updateVip={updateVip}
                type={drawerType}
            />
        </div>
    );
}