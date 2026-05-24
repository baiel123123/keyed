package com.example.Assets.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;

@CrossOrigin(origins = "https://keyed-fxn2ia7mb-baiel123123s-projects.vercel.app/")
@Controller
public class PageController {

    @GetMapping({ "/", "/index" })
    public String index() {
        return "index";
    }
}
