package com.bqc.api.planeacion.dto;

import java.util.List;

public class StockItem {


    private List<PoDetails> poDetails;
    private String name;
    private Integer numBoxes;



    public StockItem(List<PoDetails> poDetails, String name, Integer numBoxes) {
        this.poDetails = poDetails;
        this.name = name;
        this.numBoxes = numBoxes;
    }

    public void setPoDetails(List<PoDetails> poDetails) {
        this.poDetails = poDetails;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setNumBoxes(Integer numBoxes) {
        this.numBoxes = numBoxes;
    }

    public List<PoDetails> getPoDetails() {
        return poDetails;
    }

    public String getName() {
        return name;
    }

    public Integer getNumBoxes() {
        return numBoxes;
    }
}
