<?php
/**
 * Classe Validator - Validation des données
 */

namespace backend\utils;

class Validator
{
    private $errors = [];

    /**
     * Valider qu'un champ est requis
     */
    public function required($field, $value, $message = null)
    {
        if (empty($value)) {
            $this->errors[$field] = $message ?? "$field est requis";
        }
        return $this;
    }

    /**
     * Valider qu'un champ est une email valide
     */
    public function email($field, $value)
    {
        if ($value && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = "$field doit être une adresse email valide";
        }
        return $this;
    }

    /**
     * Valider qu'un champ est un nombre
     */
    public function numeric($field, $value)
    {
        if ($value && !is_numeric($value)) {
            $this->errors[$field] = "$field doit être un nombre";
        }
        return $this;
    }

    /**
     * Valider la longueur minimale
     */
    public function minLength($field, $value, $length)
    {
        if ($value && strlen($value) < $length) {
            $this->errors[$field] = "$field doit contenir au moins $length caractères";
        }
        return $this;
    }

    /**
     * Valider la longueur maximale
     */
    public function maxLength($field, $value, $length)
    {
        if ($value && strlen($value) > $length) {
            $this->errors[$field] = "$field ne doit pas dépasser $length caractères";
        }
        return $this;
    }

    /**
     * Valider qu'un champ est dans une liste d'options
     */
    public function inArray($field, $value, $options)
    {
        if ($value && !in_array($value, $options)) {
            $this->errors[$field] = "$field doit être parmi les valeurs autorisées";
        }
        return $this;
    }

    /**
     * Valider que le formulaire n'a pas d'erreurs
     */
    public function isValid()
    {
        return empty($this->errors);
    }

    /**
     * Récupérer les erreurs
     */
    public function getErrors()
    {
        return $this->errors;
    }

    /**
     * Ajouter une erreur personnalisée
     */
    public function addError($field, $message)
    {
        $this->errors[$field] = $message;
        return $this;
    }
}
?>
