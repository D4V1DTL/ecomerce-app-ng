import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import {
  Category,
  ListProduct,
  Product,
  ProductFilters,
} from '../models/product.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = environment.apiUrl; // Replace with actual API URL

  constructor(private http: HttpClient) {}

  getProducts(filters?: ProductFilters): Observable<ListProduct> {
    let params = new HttpParams();

    if (filters) {
      if (filters.search) {
        params = params.set('search', filters.search);
      }
      if (filters.category_id) {
        params = params.set('category_id', filters.category_id);
      }
      if (filters.minPrice !== undefined) {
        params = params.set('minPrice', filters.minPrice.toString());
      }
      if (filters.maxPrice !== undefined) {
        params = params.set('maxPrice', filters.maxPrice.toString());
      }
      if (filters.sortBy) {
        params = params.set('sortBy', filters.sortBy);
      }
      if (filters.page) {
        params = params.set('page', filters.page);
      }
    }

    return this.http.get<ListProduct>(`${this.apiUrl}/products`, { params });
  }

  getFeaturedProducts(): Observable<Product[]> {
    // For demo purposes, we're returning mock data
    return this.http
      .get<Category[]>(`${this.apiUrl}/products?featured=true`)
      .pipe(
        map((res: any) => {
          return res?.data;
        })
      );
  }

  getProductById(id: number): Observable<Product | undefined> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`).pipe(
      map((res: any) => {
        return res?.data;
      })
    );
  }

  getProductCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`).pipe(
      map((res: any) => {
        return res?.data;
      })
    );
  }
}
