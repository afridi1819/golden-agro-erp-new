package com.goldenagro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {

    private boolean smsSent;

    private boolean whatsappSent;

    private String message;

}