package com.datn.onlinerecruitmentsystem.dto.response;

import com.datn.onlinerecruitmentsystem.dto.request.Content;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class Candidate {
    private Content content;
}
