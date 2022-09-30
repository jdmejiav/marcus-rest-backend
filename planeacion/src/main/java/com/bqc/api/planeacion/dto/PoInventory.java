package com.bqc.api.planeacion.dto;

public class PoInventory {

    private String po;
    private String boxcode;

    public void setPo(String po) {
        this.po = po;
    }

    public void setBoxcode(String boxcode) {
        this.boxcode = boxcode;
    }

    public String getPo() {
        return po;
    }

    public String getBoxcode() {
        return boxcode;
    }
}
