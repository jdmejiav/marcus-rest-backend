package com.bqc.api.planeacion.rest;


import com.bqc.api.planeacion.dto.ItemInventory;
import com.bqc.api.planeacion.dto.PoDetails;
import com.bqc.api.planeacion.dto.PoInventory;
import com.bqc.api.planeacion.dto.StockItem;
import com.bqc.api.planeacion.feign.WebFlowersFeignClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/Inventory/GetProductInventoryHistory")
@CrossOrigin(origins = "http://localhost:3000")
public class WebFlowers {

    @Autowired
    private WebFlowersFeignClient webFlowersFeignClient;


    @GetMapping("/{companyCode}/{date}")
    public List<ItemInventory> getInventory(@PathVariable("companyCode") String companyCode, @PathVariable("date") String date){


        return webFlowersFeignClient.getInventory(companyCode,date,"67a39b7b8bbe4581aed70a1f2562a784");
    }


    @GetMapping("/getProducts")
    public Object getProducts (){
        List<ItemInventory> itemsInventory = webFlowersFeignClient.getInventory("BQC", "0", "67a39b7b8bbe4581aed70a1f2562a784");
        Map<String, StockItem> products = new HashMap<>();
        for (ItemInventory item: itemsInventory){
            if (!products.containsKey(item.getName())){
                 List<PoDetails> poDetails = new ArrayList<PoDetails>();
                 poDetails.add(new PoDetails(item.getPoId(),item.getAge(), item.getBoxes(), item.getBoxCode(), item.getCustomer()));

                products.put(item.getName(), new StockItem(poDetails, item.getName(), item.getBoxes()));
            }else{
                StockItem stockItem = products.get(item.getName());
                List<PoDetails> poDetails = stockItem.getPoDetails();
                poDetails.add(new PoDetails(item.getPoId(), item.getAge(), item.getBoxes(), item.getBoxCode(), item.getCustomer()));
                Integer boxes = Integer.sum(stockItem.getNumBoxes(), item.getBoxes()) ;
                stockItem.setNumBoxes(boxes);
                stockItem.setPoDetails(poDetails);
                products.put(item.getName(),stockItem);
            }
        }

        return  products;

    }


    @GetMapping("/getCustomers")
    public Object getCustomers (){
        List<ItemInventory> itemsInventory = webFlowersFeignClient.getInventory("BQC", "0", "67a39b7b8bbe4581aed70a1f2562a784");
        Map<String, String> customers = new HashMap<>();
        for (ItemInventory item: itemsInventory){
            customers.put(item.getCustomer(), "1");
        }

        return  customers.keySet();

    }

}
