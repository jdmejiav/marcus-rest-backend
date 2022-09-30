package com.bqc.api.planeacion.dto;

import java.time.LocalDateTime;

public class ItemInventory {

    private String zone;
    private String poId;
    private String reference;
    private String vendor;
    private String invoiceId;
    private String customer;
    private String name;
    private String integrationCode;
    private String boxCode;
    private Integer pack;
    private Integer age;
    private Integer boxes;
    private Integer units;
    private Integer stems;
    private Double amount;
    private String currentFacilityTime;
    private String executionDate;
    private String facility;

    public void setZone(String zone) {
        this.zone = zone;
    }

    public void setPoId(String poId) {
        this.poId = poId;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public void setVendor(String vendor) {
        this.vendor = vendor;
    }

    public void setInvoiceId(String invoiceId) {
        this.invoiceId = invoiceId;
    }

    public void setCustomer(String customer) {
        this.customer = customer;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setIntegrationCode(String integrationCode) {
        this.integrationCode = integrationCode;
    }

    public void setBoxCode(String boxCode) {
        this.boxCode = boxCode;
    }

    public void setPack(Integer pack) {
        this.pack = pack;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public void setBoxes(Integer boxes) {
        this.boxes = boxes;
    }

    public void setUnits(Integer units) {
        this.units = units;
    }

    public void setStems(Integer stems) {
        this.stems = stems;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public void setCurrentFacilityTime(String currentFacilityTime) {
        this.currentFacilityTime = currentFacilityTime;
    }

    public void setExecutionDate(String executionDate) {
        this.executionDate = executionDate;
    }

    public void setFacility(String facility) {
        this.facility = facility;
    }

    public String getZone() {
        return zone;
    }

    public String getPoId() {
        return poId;
    }

    public String getReference() {
        return reference;
    }

    public String getVendor() {
        return vendor;
    }

    public String getInvoiceId() {
        return invoiceId;
    }

    public String getCustomer() {
        return customer;
    }

    public String getName() {
        return name;
    }

    public String getIntegrationCode() {
        return integrationCode;
    }

    public String getBoxCode() {
        return boxCode;
    }

    public Integer getPack() {
        return pack;
    }

    public Integer getAge() {
        return age;
    }

    public Integer getBoxes() {
        return boxes;
    }

    public Integer getUnits() {
        return units;
    }

    public Integer getStems() {
        return stems;
    }

    public Double getAmount() {
        return amount;
    }

    public String getCurrentFacilityTime() {
        return currentFacilityTime;
    }

    public String getExecutionDate() {
        return executionDate;
    }

    public String getFacility() {
        return facility;
    }
}
