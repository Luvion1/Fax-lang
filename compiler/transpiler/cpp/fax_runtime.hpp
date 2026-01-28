/**
 * @file fax_runtime.hpp
 * @brief Corporate Standard Runtime for Fax-lang
 */

#ifndef FAX_RUNTIME_HPP
#define FAX_RUNTIME_HPP

#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>
#include <algorithm>
#include <memory>

namespace fax_std {

    /**
     * @brief High-performance printing utility
     */
    template<typename T>
    void print_item(const T& val) {
        std::cout << val;
    }

    template<typename T, typename... Args>
    void println(T first, Args... args) {
        std::cout << first;
        if constexpr (sizeof...(args) > 0) {
            std::cout << " ";
            println(args...);
        } else {
            std::cout << std::endl;
        }
    }

    inline void println() {
        std::cout << std::endl;
    }

    /**
     * @brief Safe pointer wrapper
     */
    template<typename T>
    class Ptr {
    private:
        T* data;
    public:
        Ptr() : data(nullptr) {}
        Ptr(T* p) : data(p) {
            if (!p) throw std::runtime_error("Fax-lang: Null pointer access attempt");
        }
        T& operator*() { return *data; }
        T* operator->() { return data; }
        T* get() { return data; }
        bool is_null() const { return data == nullptr; }
    };

    /**
     * @brief Safe array access wrapper
     */
    template<typename T>
    class Array : public std::vector<T> {
    public:
        using std::vector<T>::vector;
        
        template<typename Iter>
        Array(Iter first, Iter last) : std::vector<T>(first, last) {}

        T& operator[](size_t index) {
            if (index >= this->size()) {
                throw std::out_of_range("Fax-lang: Array index out of bounds");
            }
            return std::vector<T>::at(index);
        }
        const T& operator[](size_t index) const {
            if (index >= this->size()) {
                throw std::out_of_range("Fax-lang: Array index out of bounds");
            }
            return std::vector<T>::at(index);
        }
    };

} // namespace fax_std

#endif // FAX_RUNTIME_HPP
