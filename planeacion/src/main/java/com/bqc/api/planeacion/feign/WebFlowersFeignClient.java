package com.bqc.api.planeacion.feign;


import com.bqc.api.planeacion.dto.ItemInventory;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@FeignClient(url = "https://webflowers.azure-api.net", name = "webflowers")

public interface WebFlowersFeignClient {


    @RequestMapping(method = RequestMethod.GET, value = "/Inventory/GetProductInventoryHistory/{CompanyName}/{Date}")
    List<ItemInventory> getInventory(@PathVariable("CompanyName") String CompanyName, @PathVariable("Date") String date,
                                     @RequestHeader(required = false, defaultValue = "67a39b7b8bbe4581aed70a1f2562a784",
                                             name = "Ocp-Apim-Subscription-Key")String key );

}
