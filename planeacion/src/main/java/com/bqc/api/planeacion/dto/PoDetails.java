package com.bqc.api.planeacion.dto;

import java.time.LocalDateTime;

public class PoDetails {

    private String po;

    private Integer age;

    private Integer numBoxes;

    private String boxType;

    public void setPo(String po) {
        this.po = po;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public void setNumBoxes(Integer numBoxes) {
        this.numBoxes = numBoxes;
    }

    public void setBoxType(String boxType) {
        this.boxType = boxType;
    }

    public String getPo() {
        return po;
    }

    public Integer getAge() {
        return age;
    }

    public Integer getNumBoxes() {
        return numBoxes;
    }

    public String getBoxType() {
        return boxType;
    }


    public PoDetails(String po, Integer age, Integer numBoxes, String boxType) {
        this.po = po;
        this.age = age;
        this.numBoxes = numBoxes;
        this.boxType = boxType;
    }
}
